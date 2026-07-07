import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { getWeekDates, formatDate, getWeekStart } from '../utils/dateUtils';
import { calculateDynamicGoal } from '../utils/habitUtils';

function BuddiesPage({ user }) {
  const [buddies, setBuddies] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [buddyEmail, setBuddyEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buddyStats, setBuddyStats] = useState({});
  const [requestProfiles, setRequestProfiles] = useState({});

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setBuddies(data.friends || []);
        setFriendRequests(data.friendRequests || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Load profiles for incoming friend requests
  useEffect(() => {
    if (friendRequests.length === 0) {
        setRequestProfiles({});
        return;
    }

    const unsubscribes = [];
    
    friendRequests.forEach(reqUid => {
      const reqUserRef = doc(db, 'users', reqUid);
      const unsubUser = onSnapshot(reqUserRef, (userSnap) => {
        if (userSnap.exists()) {
          setRequestProfiles(prev => ({
            ...prev,
            [reqUid]: userSnap.data()
          }));
        }
      });
      unsubscribes.push(unsubUser);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [friendRequests]);

  // Load buddy stats whenever the buddies list changes
  useEffect(() => {
    if (buddies.length === 0) return;

    const unsubscribes = [];
    
    buddies.forEach(buddyUid => {
      // 1. Get Buddy's User Profile
      const buddyUserRef = doc(db, 'users', buddyUid);
      const unsubUser = onSnapshot(buddyUserRef, (userSnap) => {
        if (userSnap.exists()) {
          setBuddyStats(prev => ({
            ...prev,
            [buddyUid]: { ...prev[buddyUid], profile: userSnap.data() }
          }));
        }
      });
      unsubscribes.push(unsubUser);

      // 2. Get Buddy's Habits
      const buddyHabitsRef = doc(db, 'user_habits', buddyUid);
      const unsubHabits = onSnapshot(buddyHabitsRef, (habitsSnap) => {
        if (habitsSnap.exists()) {
          const habits = habitsSnap.data().habits || [];
          
          // Calculate this week's progress
          const currentWeekStart = getWeekStart(new Date());
          const weekDates = getWeekDates(currentWeekStart);
          
          let totalGoal = 0;
          let totalCompleted = 0;

          habits.forEach(habit => {
            const goal = calculateDynamicGoal(habit.frequency, weekDates, habit.customDays);
            totalGoal += goal;
            
            weekDates.forEach(date => {
              const dateStr = formatDate(date);
              const dayOfWeek = date.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              let isDisabled = false;
              if (habit.frequency === 'weekdays' && isWeekend) isDisabled = true;
              if (habit.frequency === 'weekends' && !isWeekend) isDisabled = true;
              if (habit.frequency === 'custom' && habit.customDays && !habit.customDays.includes(dayOfWeek)) isDisabled = true;
              
              if (habit.completions && habit.completions[dateStr] && !isDisabled) {
                totalCompleted++;
              }
            });
          });

          const progressPercentage = totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0;

          setBuddyStats(prev => ({
            ...prev,
            [buddyUid]: { ...prev[buddyUid], progress: progressPercentage > 100 ? 100 : progressPercentage, totalCompleted, totalGoal, habitsCount: habits.length }
          }));
        } else {
            setBuddyStats(prev => ({
                ...prev,
                [buddyUid]: { ...prev[buddyUid], progress: 0, totalCompleted: 0, totalGoal: 0, habitsCount: 0 }
            }));
        }
      });
      unsubscribes.push(unsubHabits);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [buddies]);

  const handleAddBuddy = async (e) => {
    e.preventDefault();
    if (!buddyEmail.trim()) return;
    setError('');

    try {
      if (buddyEmail.toLowerCase() === user.email.toLowerCase()) {
        setError("You can't add yourself as a buddy!");
        return;
      }

      const q = query(collection(db, 'users'), where('email', '==', buddyEmail.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No user found with that email address.");
        return;
      }

      // Found the user
      const buddyDoc = querySnapshot.docs[0];
      const buddyUid = buddyDoc.id;

      if (buddies.includes(buddyUid)) {
        setError("This user is already your buddy.");
        return;
      }

      // Send a friend request to the target user
      const buddyRef = doc(db, 'users', buddyUid);
      await updateDoc(buddyRef, {
        friendRequests: arrayUnion(user.uid)
      });

      setBuddyEmail('');
      alert('Friend request sent!');
    } catch (err) {
      console.error(err);
      setError("Failed to add buddy.");
    }
  };

  const handleAcceptRequest = async (reqUid) => {
    try {
      const currentUserRef = doc(db, 'users', user.uid);
      const requesterRef = doc(db, 'users', reqUid);
      
      // Update current user
      await updateDoc(currentUserRef, {
        friends: arrayUnion(reqUid),
        friendRequests: arrayRemove(reqUid)
      });

      // Update requester
      await updateDoc(requesterRef, {
        friends: arrayUnion(user.uid)
      });
    } catch (err) {
      console.error(err);
      setError("Failed to accept request.");
    }
  };

  const handleDeclineRequest = async (reqUid) => {
    try {
      const currentUserRef = doc(db, 'users', user.uid);
      await updateDoc(currentUserRef, {
        friendRequests: arrayRemove(reqUid)
      });
    } catch (err) {
      console.error(err);
      setError("Failed to decline request.");
    }
  };

  if (!user || loading) return null;

  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Accountability Buddies</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Link up with friends to stay motivated and view their weekly progress.</p>
      </header>

      {/* Add Buddy Section */}
      <div style={{ background: 'var(--card-background)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Add a Buddy</h2>
        <form onSubmit={handleAddBuddy} className="flex-responsive-row">
          <input 
            type="email" 
            placeholder="Enter friend's email address" 
            value={buddyEmail}
            onChange={(e) => setBuddyEmail(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-primary)' }}
          />
          <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Add
          </button>
        </form>
        {error && <div style={{ color: 'var(--error-text)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}
      </div>

      {/* Pending Requests */}
      {friendRequests.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Pending Requests</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {friendRequests.map(reqUid => {
              const profile = requestProfiles[reqUid];
              if (!profile) return null;

              return (
                <div key={reqUid} className="flex-responsive" style={{ alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-background)', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{profile.name || 'User'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{profile.email} sent you a request</div>
                    </div>
                  </div>
                  <div className="flex-responsive-row">
                    <button onClick={() => handleAcceptRequest(reqUid)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Accept</button>
                    <button onClick={() => handleDeclineRequest(reqUid)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer' }}>Decline</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Buddies List */}
      <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Your Buddies</h2>
      
      {buddies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any buddies yet. Add someone above!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {buddies.map(buddyUid => {
            const stats = buddyStats[buddyUid];
            if (!stats || !stats.profile) return null; // Still loading

            const profile = stats.profile;
            const progress = stats.progress || 0;

            return (
              <div key={buddyUid} className="flex-responsive-row" style={{ alignItems: 'center', background: 'var(--card-background)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                {/* Avatar */}
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'B'}
                </div>
                
                {/* Info & Progress */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>{profile.name || profile.email}</h3>
                    <span style={{ fontWeight: 'bold', color: progress >= 100 ? 'var(--primary-color)' : 'var(--text-primary)' }}>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--background-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.5s ease-out' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {stats.habitsCount > 0 ? `${stats.totalCompleted}/${stats.totalGoal} habits completed this week` : 'No habits yet'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BuddiesPage;
