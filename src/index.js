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
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  updateDoc, 
  arrayUnion 
} from 'firebase/firestore';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Camera, 
  Clock, 
  Ticket,
  CheckCircle2,
  Lock,
  ShieldCheck,
  CreditCard,
  Info,
  AlertCircle
} from 'lucide-react';

// --- CONFIGURATION ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'tech-wealth-v3';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [view, setView] = useState('landing'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('en');

  // 1. SAFE AUTHENTICATION
  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth System Error:", err);
        setError("Connection error. Please refresh.");
      }
    };
    handleAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. SAFE DATA SYNC (NULL-GUARDED)
  useEffect(() => {
    if (!user) return;

    // Profile Listener
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      } else {
        setDoc(userRef, {
          uid: user.uid,
          isBlacklisted: false,
          paymentVerified: false,
          role: 'member'
        }).catch(e => console.error("Initial doc error", e));
      }
    }, (err) => {
      console.error("User sync failed", err);
    });

    // Event Listener
    const eventRef = doc(db, 'artifacts', appId, 'public', 'data', 'upcomingEvent');
    const unsubEvent = onSnapshot(eventRef, (snap) => {
      if (snap.exists()) {
        setEventData(snap.data());
      } else {
        setDoc(eventRef, {
          location: "Premium Restaurant, Central",
          date: "TBA 2026",
          time: "19:00",
          attendees: [],
          gallery: []
        }).catch(e => console.error("Event seed error", e));
      }
    }, (err) => {
      console.error("Event sync failed", err);
    });

    return () => { unsubUser(); unsubEvent(); };
  }, [user]);

  const handleRegisterEvent = async () => {
    if (!userData?.paymentVerified) return alert("Verify payment first.");
    try {
      const eventRef = doc(db, 'artifacts', appId, 'public', 'data', 'upcomingEvent');
      await updateDoc(eventRef, {
        attendees: arrayUnion({
          uid: user.uid,
          name: `Member ${user.uid.substring(0, 5)}`,
          photo: `https://ui-avatars.com/api/?name=${user.uid}&background=0D6EFD&color=fff`
        })
      });
    } catch (err) {
      alert("Registration failed. Please try again.");
    }
  };

  const verifyPayment = async () => {
    try {
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await updateDoc(userRef, { paymentVerified: true });
    } catch (err) {
      console.error("Verification error", err);
    }
  };

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="space-y-4">
        <AlertCircle className="mx-auto text-red-500 w-12 h-12" />
        <p className="text-white font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 px-6 py-2 rounded-lg text-sm">Retry Connection</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-blue-500 font-black text-xs tracking-widest uppercase">Initializing Vault</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#020617]/90 backdrop-blur-md border-b border-white/5 h-16 flex items-center px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-black">TW</div>
            <span className="font-black text-lg tracking-tighter italic">TECHWEALTH</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 border border-white/10 rounded">
              {lang === 'en' ? 'ZH' : 'EN'}
            </button>
            <button onClick={() => setView('events')} className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
              {lang === 'en' ? 'EVENTS' : '聚會'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-grow pt-24 pb-12 w-full max-w-7xl mx-auto px-4 md:px-8">
        {view === 'landing' ? (
          <div className="py-12 text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
             <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
              {lang === 'en' ? "Trade Digital," : "數碼貿易，"} <br/> 
              <span className="text-blue-600">{lang === 'en' ? "Meet Physical." : "線下聚首。"}</span>
            </h1>
            <p className="text-lg text-slate-400 mb-12 leading-relaxed">
              {lang === 'en' ? "The networking portal for verified marketplace members." : "為經過驗證的市場成員提供的交流門戶。"}
            </p>
            <button onClick={() => setView('events')} className="bg-blue-600 px-10 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 mx-auto hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20">
              <Calendar size={18} /> {lang === 'en' ? "UPCOMING GATHERING" : "查看即將舉行的活動"}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-12">
            {/* Header Card */}
            <div className="bg-slate-900/50 border border-white/5 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest">
                    <Info size={14}/> {lang === 'en' ? 'Networking Portal' : '交流門戶'}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
                    {eventData?.location || "Loading Location..."}
                  </h2>
                  <div className="flex flex-wrap gap-6 text-slate-400 font-bold text-sm">
                    <span className="flex items-center gap-2"><Calendar size={16} className="text-blue-600" /> {eventData?.date || "TBA"}</span>
                    <span className="flex items-center gap-2"><Clock size={16} className="text-blue-600" /> {eventData?.time || "TBA"}</span>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  {!userData?.paymentVerified ? (
                    <button onClick={verifyPayment} className="w-full bg-white text-slate-950 px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition">
                      <CreditCard size={18} /> {lang === 'en' ? 'VERIFY PAYMENT' : '驗證付款'}
                    </button>
                  ) : eventData?.attendees?.some(a => a.uid === user.uid) ? (
                    <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> {lang === 'en' ? 'SEAT RESERVED' : '席位已預留'}
                    </div>
                  ) : (
                    <button onClick={handleRegisterEvent} className="w-full bg-blue-600 px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-500 transition shadow-xl shadow-blue-600/30">
                      <Ticket size={18} /> {lang === 'en' ? 'PAY $50 TO JOIN' : '支付 $50 加入'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Users size={20} className="text-blue-600" /> {lang === 'en' ? 'ATTENDEES' : '參與者'}
                    <span className="text-slate-500 text-sm ml-2">({eventData?.attendees?.length || 0})</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {eventData?.attendees?.map((member, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-3">
                        <img src={member.photo} className="w-10 h-10 rounded-full" alt="avatar" />
                        <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Camera size={20} className="text-blue-600" /> {lang === 'en' ? 'GATHERING ARCHIVE' : '聚會存檔'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {eventData?.gallery?.length > 0 ? eventData.gallery.map((img, i) => (
                      <div key={i} className="aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/5">
                        <img src={img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt="moment" />
                      </div>
                    )) : (
                      <div className="col-span-full h-32 bg-white/5 rounded-3xl flex items-center justify-center text-slate-600 text-xs uppercase tracking-widest italic">
                        No photos yet
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
                  <h4 className="font-black text-xs text-blue-600 uppercase tracking-[0.2em] mb-6">{lang === 'en' ? 'Safety Protocol' : '安全守則'}</h4>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded bg-blue-600/10 flex items-center justify-center shrink-0"><ShieldCheck size={16} className="text-blue-600"/></div>
                      <p className="text-xs text-slate-400 leading-relaxed">{lang === 'en' ? 'Members must have an active escrow account for check-in.' : '成員必須擁有活躍的託管帳戶方可簽到。'}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded bg-blue-600/10 flex items-center justify-center shrink-0"><MapPin size={16} className="text-blue-600"/></div>
                      <p className="text-xs text-slate-400 leading-relaxed">{lang === 'en' ? 'Restaurant details are shared privately after registration.' : '餐廳詳細信息將在報名後私下分享。'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-white/5 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
        Verified Ecosystem • Securing Your Network
      </footer>
    </div>
  );
}



import ReactDOM from 'react-dom/client';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
