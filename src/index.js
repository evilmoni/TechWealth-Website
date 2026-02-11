import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion,
  setDoc,
  getDoc
} from 'firebase/firestore';

// --- CONFIG ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'tw-v5-stable';

// --- INLINE ICONS ---
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconExternal = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [view, setView] = useState('landing');
  const [initStatus, setInitStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const startSession = async () => {
      try {
        // 1. Auth First
        let cred;
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          cred = await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          cred = await signInAnonymously(auth);
        }
        
        if (!mounted) return;
        const currentUser = cred.user;
        setUser(currentUser);

        // 2. Setup Correct Document Paths (Even segments only)
        // Path: artifacts (col) / appId (doc) / users (col) / userId (doc)
        const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid);
        // Path: artifacts (col) / appId (doc) / public (col) / data (doc)
        const eventRef = doc(db, 'artifacts', appId, 'public', 'data');

        // Initial Data Fetch
        const [uSnap, eSnap] = await Promise.all([getDoc(userRef), getDoc(eventRef)]);
        
        if (mounted) {
          if (uSnap.exists()) {
            setUserData(uSnap.data());
          } else {
            const initialProfile = { uid: currentUser.uid, verified: false, joined: Date.now() };
            setUserData(initialProfile);
            setDoc(userRef, initialProfile).catch(() => {});
          }

          if (eSnap.exists()) {
            setEventData(eSnap.data());
          } else {
            const initialEvent = {
              title: "VIP Networking Dinner",
              location: "The Peninsula, Tsim Sha Tsui",
              date: "Feb 28, 2026",
              time: "19:30",
              price: 50,
              attendees: [],
              tgLink: "t.me/+KvxFxWrjnv00NTNI"
            };
            setEventData(initialEvent);
            setDoc(eventRef, initialEvent).catch(() => {});
          }
          setInitStatus('active');
        }

        // 3. Subscriptions
        const unsubU = onSnapshot(userRef, (s) => s.exists() && setUserData(s.data()));
        const unsubE = onSnapshot(eventRef, (s) => s.exists() && setEventData(s.data()));

        return () => { unsubU(); unsubE(); };
      } catch (err) {
        console.error(err);
        if (mounted) {
          setInitStatus('error');
          setErrorMessage(err.message);
        }
      }
    };

    startSession();
    return () => { mounted = false; };
  }, []);

  const handleJoin = async () => {
    if (!user || !userData) return;
    const confirm = window.confirm(`Join "${eventData?.title}"? Confirmation fee: $${eventData?.price}`);
    if (confirm) {
      try {
        const eventRef = doc(db, 'artifacts', appId, 'public', 'data');
        await updateDoc(eventRef, {
          attendees: arrayUnion({
            uid: user.uid,
            name: `Member_${user.uid.slice(0, 4)}`,
            timestamp: Date.now()
          })
        });
      } catch (e) {
        alert("Action failed. Verification required.");
      }
    }
  };

  if (initStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase">Authenticating Protocol...</p>
        </div>
      </div>
    );
  }

  if (initStatus === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-6">
          <div className="text-red-500 text-5xl font-black">!</div>
          <div className="space-y-2">
            <h2 className="text-white font-black uppercase tracking-tight text-xl">Connection Error</h2>
            <p className="text-slate-500 text-[11px] leading-relaxed font-mono px-4">{errorMessage}</p>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl">Initialize Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-blue-600/30 font-sans">
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 h-16 px-6">
        <div className="max-w-6xl mx-auto h-full flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic shadow-lg shadow-blue-600/20 text-white">TW</div>
            <span className="font-black text-xl tracking-tighter italic">TECHWEALTH</span>
          </div>
          <button onClick={() => setView('events')} className="text-[10px] font-black bg-white text-black px-5 py-2.5 rounded-full hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">Portal</button>
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-6xl mx-auto pb-24">
        {view === 'landing' ? (
          <div className="py-24 flex flex-col items-center text-center space-y-12">
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] animate-in fade-in slide-in-from-top-8 duration-700">
              Verified<br/><span className="text-blue-600">Growth.</span>
            </h1>
            <p className="text-slate-400 max-w-md text-lg font-medium leading-relaxed opacity-80">
              High-tier networking for validated digital asset traders and marketplace leaders.
            </p>
            <button onClick={() => setView('events')} className="px-12 py-6 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:scale-105 transition-transform shadow-2xl shadow-blue-600/30">
              Enter The Collective
            </button>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* MAIN EVENT CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-8 md:p-14 rounded-[3rem] shadow-2xl">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
                <div className="space-y-8 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                    Next Gathering Scheduled
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">{eventData?.title}</h2>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-10 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <div className="flex items-center gap-3"><IconCalendar /> {eventData?.date}</div>
                    <div className="flex items-center gap-3"><IconUsers /> {eventData?.attendees?.length || 0} Members</div>
                  </div>
                </div>
                <div className="w-full lg:w-auto">
                  {eventData?.attendees?.some(a => a.uid === user?.uid) ? (
                    <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-12 py-6 rounded-3xl font-black text-xs uppercase text-center shadow-inner">
                      Seat Reserved &bull; Access Granted
                    </div>
                  ) : (
                    <button onClick={handleJoin} className="w-full px-12 py-6 bg-white text-black rounded-3xl font-black text-xs tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                      Secure Reservation — ${eventData?.price}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              {/* DETAILS & ROSTER */}
              <div className="lg:col-span-8 space-y-16">
                <section>
                  <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-slate-800"></span> Gathering Logistics
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 group hover:bg-white/[0.07] transition-colors">
                      <div className="text-blue-500 mb-3 uppercase text-[9px] font-black tracking-[0.2em]">Primary Venue</div>
                      <p className="font-black text-xl text-white uppercase italic leading-tight">{eventData?.location}</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 group hover:bg-white/[0.07] transition-colors">
                      <div className="text-blue-500 mb-3 uppercase text-[9px] font-black tracking-[0.2em]">Entry Time</div>
                      <p className="font-black text-xl text-white uppercase italic leading-tight">{eventData?.time} Sharp</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-slate-800"></span> Verified Members
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {eventData?.attendees?.map((att, idx) => (
                      <div key={idx} className="bg-slate-900 px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-3 shadow-lg">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white italic">M</div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{att.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* PROTOCOL SIDEBAR */}
              <aside className="lg:col-span-4 space-y-8">
                <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                    <h4 className="font-black text-[11px] text-blue-500 uppercase tracking-widest">Invite Protocol</h4>
                    
                    <div className="space-y-4">
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Telegram Gateway</p>
                       <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-blue-400 break-all flex justify-between items-center group cursor-pointer" onClick={() => window.open(`https://${eventData?.tgLink}`)}>
                          {eventData?.tgLink}
                          <IconExternal />
                       </div>
                    </div>

                    <div className="p-6 bg-white rounded-3xl flex flex-col items-center justify-center gap-4 aspect-square shadow-2xl shadow-blue-600/10">
                       <div className="w-full h-full border-4 border-black/5 rounded-2xl flex items-center justify-center relative">
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://t.me/+KvxFxWrjnv00NTNI" alt="QR" className="w-3/4 opacity-90" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                             </div>
                          </div>
                       </div>
                       <p className="text-[9px] text-black font-black uppercase tracking-widest opacity-40">Scan to Sync</p>
                    </div>

                    <ul className="space-y-5">
                      {[
                        "Identity validation required at entrance.",
                        "Table location shared via private DM.",
                        "Strict no-solicitation policy."
                      ].map((text, i) => (
                        <li key={i} className="flex gap-4 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">{text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-600/5 blur-[80px] rounded-full"></div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="py-16 border-t border-white/5 text-center text-slate-800 text-[10px] font-black uppercase tracking-[0.8em]">
        TW Collective &bull; End-to-End Encrypted
      </footer>
    </div>
  );
}

