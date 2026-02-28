import React, { useState, useEffect, useRef } from 'react';
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
  query, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Users, 
  Calendar, 
  Target, 
  CreditCard, 
  ShieldCheck, 
  Globe, 
  ChevronRight, 
  Clock, 
  Lock, 
  ExternalLink,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'tech-wealth-v1';

// --- Translations ---
const translations = {
  en: {
    navHome: "Home",
    navEvents: "Events",
    navVision: "Vision",
    navJoin: "Join Us",
    navMembers: "VIP Access",
    heroTitle: "TechWealth Elite",
    heroSub: "The ultimate hub for high-net-worth business leaders. Leverage collective human capital for explosive client acquisition.",
    memberCount: "Global Members",
    ctaJoin: "Apply for Membership",
    standardEvents: "Standard Events",
    vipEvents: "VIP Masterminds",
    days: "d",
    hours: "h",
    mins: "m",
    secs: "s",
    attendees: "Attendees",
    visionTitle: "Our Mission & Strategy",
    visionStrategy: "The Roadmap to Affluence",
    regTitle: "Secure Gateway",
    regSub: "Elite status requires a singular commitment.",
    payMethod: "Select Payment Method",
    processPayment: "Complete Registration",
    membershipId: "Unique Membership ID",
    accessGranted: "Access Granted",
    redirectMsg: "Unauthorized access. Redirecting to payment...",
    telegramBtn: "Join Private Telegram",
    lockedContent: "This area is reserved for verified members only.",
    mission1: "Joint Ventures",
    mission1Desc: "Strategic partnerships between industry titans.",
    mission2: "High-Ticket Pipeline",
    mission2Desc: "Exclusive access to $1M+ lead generation networks.",
    mission3: "HR Leveraging",
    mission3Desc: "Optimizing human capital for maximum efficiency."
  },
  zh: {
    navHome: "首頁",
    navEvents: "活動",
    navVision: "願景",
    navJoin: "加入我們",
    navMembers: "貴賓登錄",
    heroTitle: "TechWealth 財富精英會",
    heroSub: "高淨值商業領袖的終極樞紐。利用集體人力資源實現爆炸式的客戶獲取。",
    memberCount: "全球會員人數",
    ctaJoin: "申請加入",
    standardEvents: "標準活動",
    vipEvents: "VIP 策劃會",
    days: "天",
    hours: "時",
    mins: "分",
    secs: "秒",
    attendees: "參與人數",
    visionTitle: "我們的使命與戰略",
    visionStrategy: "富足之路",
    regTitle: "安全網關",
    regSub: "精英地位需要專一的承諾。",
    payMethod: "選擇支付方式",
    processPayment: "完成註冊",
    membershipId: "唯一會員 ID",
    accessGranted: "授權訪問",
    redirectMsg: "未經授權。正在跳轉至支付頁面...",
    telegramBtn: "加入私密 Telegram 群組",
    lockedContent: "此區域僅限已驗證會員進入。",
    mission1: "合資經營",
    mission1Desc: "行業巨頭之間的戰略合作夥伴關係。",
    mission2: "高價成交渠道",
    mission2Desc: "獨家獲取 100 萬美元以上的潛在客戶網絡。",
    mission3: "人力資源優化",
    mission3Desc: "優化人力資本以實現最大效率。"
  }
};

// --- Components ---

const Navbar = ({ activePage, setActivePage, lang, setLang, isMember }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang];

  const navItems = [
    { id: 'home', label: t.navHome },
    { id: 'events', label: t.navEvents },
    { id: 'vision', label: t.navVision },
    { id: 'register', label: t.navJoin },
    { id: 'members', label: t.navMembers, protected: true },
  ];

  return (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage('home')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
              TechWealth
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`text-sm font-medium transition-colors ${
                  activePage === item.id ? 'text-amber-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-1 text-xs px-3 py-1 border border-emerald-800 rounded-full text-emerald-400 hover:bg-emerald-900/20 transition-all"
            >
              <Globe size={14} /> {lang === 'en' ? '繁中' : 'EN'}
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black border-b border-emerald-900/30 p-4 space-y-4 animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setIsOpen(false); }}
              className="block w-full text-left px-4 py-2 text-gray-400 hover:text-amber-400"
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="w-full text-left px-4 py-2 text-emerald-400"
          >
            {lang === 'en' ? 'Switch to Traditional Chinese' : '切換至英文'}
          </button>
        </div>
      )}
    </nav>
  );
};

const Counter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);

  useEffect(() => {
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const EventCard = ({ title, date, attendees, countdownDate, isVip, lang }) => {
  const t = translations[lang];
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const distance = new Date(countdownDate).getTime() - new Date().getTime();
      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [countdownDate]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all hover:scale-[1.02] duration-300 ${
      isVip ? 'bg-gradient-to-br from-emerald-950 to-black border-amber-500/30' : 'bg-zinc-900 border-zinc-800'
    }`}>
      <div className="h-48 w-full bg-zinc-800 flex items-center justify-center overflow-hidden">
         <img 
          src={`https://images.unsplash.com/photo-${isVip ? '1507679799987-c73779587ccf' : '1515187029135-18ee286d815b'}?auto=format&fit=crop&q=80&w=800`} 
          alt="Event" 
          className="w-full h-full object-cover opacity-60"
        />
        {isVip && <div className="absolute top-4 left-4 bg-amber-500 text-black font-bold text-xs px-2 py-1 rounded">VIP EXCLUSIVE</div>}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{date}</span>
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <Users size={14} /> {attendees} {t.attendees}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-4 line-clamp-1">{title}</h3>
        <div className="grid grid-cols-4 gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{timeLeft.d}</div>
            <div className="text-[10px] text-zinc-500 uppercase">{t.days}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{timeLeft.h}</div>
            <div className="text-[10px] text-zinc-500 uppercase">{t.hours}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{timeLeft.m}</div>
            <div className="text-[10px] text-zinc-500 uppercase">{t.mins}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{timeLeft.s}</div>
            <div className="text-[10px] text-zinc-500 uppercase">{t.secs}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState('en');
  const [activePage, setActivePage] = useState('home');
  const [user, setUser] = useState(null);
  const [membershipId, setMembershipId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'membership', 'status');
    const unsub = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setMembershipId(docSnap.data().memberId);
      }
    }, (err) => console.error(err));
    return () => unsub();
  }, [user]);

  // Security Guard for Page 5
  useEffect(() => {
    if (activePage === 'members' && !membershipId) {
      const timer = setTimeout(() => {
        setActivePage('register');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [activePage, membershipId]);

  const handlePayment = async () => {
    if (!user) return;
    setIsProcessing(true);
    // Simulate payment delay
    await new Promise(r => setTimeout(r, 2000));
    
    const newId = `TW-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'membership', 'status');
    await setDoc(userDocRef, {
      memberId: newId,
      joinedAt: new Date().toISOString(),
      tier: 'Elite'
    });
    
    setIsProcessing(false);
    setMembershipId(newId);
    setActivePage('members');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div className="pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium animate-pulse">
                <ShieldCheck size={16} /> Elite Networking Group
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                {t.heroSub}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <button 
                  onClick={() => setActivePage('register')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  {t.ctaJoin} <ChevronRight size={20} />
                </button>
                <button 
                   onClick={() => setActivePage('events')}
                   className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-all"
                >
                  {t.navEvents}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
                <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">
                    <Counter target={1250} />+
                  </div>
                  <div className="text-zinc-500 font-medium">{t.memberCount}</div>
                </div>
                <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">
                    $<Counter target={450} />M+
                  </div>
                  <div className="text-zinc-500 font-medium">{lang === 'en' ? 'Asset Value' : '資產價值'}</div>
                </div>
                <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">
                    <Counter target={12} />
                  </div>
                  <div className="text-zinc-500 font-medium">{lang === 'en' ? 'Global Chapters' : '全球分會'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-amber-400 mb-12 flex items-center gap-3">
              <Calendar /> {t.standardEvents}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <EventCard 
                title={lang === 'en' ? "Luxury Yacht Networking" : "豪華遊艇社交會"}
                date="Oct 24, 2024"
                attendees={45}
                countdownDate="2024-10-24T18:00:00"
                lang={lang}
              />
              <EventCard 
                title={lang === 'en' ? "Global FinTech Summit" : "全球金融科技峰會"}
                date="Nov 12, 2024"
                attendees={120}
                countdownDate="2024-11-12T09:00:00"
                lang={lang}
              />
               <EventCard 
                title={lang === 'en' ? "Real Estate Portfolio" : "房地產投資組合研討"}
                date="Dec 05, 2024"
                attendees={30}
                countdownDate="2024-12-05T14:00:00"
                lang={lang}
              />
            </div>

            <h2 className="text-3xl font-bold text-emerald-400 mb-12 flex items-center gap-3">
              <ShieldCheck /> {t.vipEvents}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <EventCard 
                isVip
                title={lang === 'en' ? "Private Island M&A Mastermind" : "私人島嶼併購大師會"}
                date="Nov 30, 2024"
                attendees={12}
                countdownDate="2024-11-30T10:00:00"
                lang={lang}
              />
               <EventCard 
                isVip
                title={lang === 'en' ? "Billionaire Tech Synergy" : "億萬富翁技術協同"}
                date="Jan 15, 2025"
                attendees={8}
                countdownDate="2025-01-15T20:00:00"
                lang={lang}
              />
            </div>
          </div>
        );

      case 'vision':
        return (
          <div className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">{t.visionTitle}</h2>
              <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-zinc-900 p-10 rounded-[2rem] border border-zinc-800 shadow-2xl relative group">
                <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <Target size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t.mission1}</h3>
                <p className="text-zinc-400 leading-relaxed">{t.mission1Desc}</p>
              </div>
              <div className="bg-zinc-900 p-10 rounded-[2rem] border border-zinc-800 shadow-2xl relative group">
                <div className="w-16 h-16 bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                  <CreditCard size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t.mission2}</h3>
                <p className="text-zinc-400 leading-relaxed">{t.mission2Desc}</p>
              </div>
              <div className="bg-zinc-900 p-10 rounded-[2rem] border border-zinc-800 shadow-2xl relative group">
                <div className="w-16 h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Users size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t.mission3}</h3>
                <p className="text-zinc-400 leading-relaxed">{t.mission3Desc}</p>
              </div>
            </div>

            <div className="mt-20 p-12 bg-gradient-to-r from-emerald-950/40 to-black rounded-[3rem] border border-emerald-500/10">
               <h4 className="text-2xl font-bold text-amber-400 mb-6 uppercase tracking-widest">{t.visionStrategy}</h4>
               <div className="space-y-6">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="flex gap-4 items-start">
                     <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                       {i}
                     </div>
                     <p className="text-zinc-300 text-lg">
                       {lang === 'en' 
                        ? ["Identification of High-Ticket Opportunities", "Vetting Participants for Alignment", "Capital Pooling & Asset Synergy", "Scaled Acquisition & Dividends"][i-1]
                        : ["識別高價成交機會", "審查參與者的匹配度", "資本池化與資產協同", "規模化獲取與利潤分紅"][i-1]
                       }
                     </p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        );

      case 'register':
        return (
          <div className="pt-32 pb-20 px-4 max-w-xl mx-auto">
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{t.regTitle}</h2>
                <p className="text-zinc-500">{t.regSub}</p>
              </div>

              {membershipId ? (
                <div className="text-center p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in zoom-in-95 duration-500">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-white mb-2">{t.accessGranted}</h3>
                  <p className="text-zinc-400 mb-6 text-sm">{t.membershipId}</p>
                  <div className="bg-black py-3 rounded-lg text-emerald-400 font-mono text-xl tracking-widest border border-emerald-500/30">
                    {membershipId}
                  </div>
                  <button 
                    onClick={() => setActivePage('members')}
                    className="mt-8 w-full py-4 bg-emerald-600 text-white rounded-xl font-bold"
                  >
                    Enter Member Portal
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="First Name" />
                    <input className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Last Name" />
                  </div>
                  <input className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Business Email" />
                  
                  <div className="pt-4">
                    <p className="text-sm text-zinc-500 mb-4">{t.payMethod}</p>
                    <div className="grid grid-cols-4 gap-3 opacity-60">
                      {['Apple Pay', 'Google Pay', 'Stripe', 'Visa'].map(p => (
                        <div key={p} className="h-10 border border-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-zinc-300 bg-zinc-800/30">
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Clock className="animate-spin" /> : <CreditCard />}
                    {isProcessing ? (lang === 'en' ? 'Processing...' : '正在處理...') : t.processPayment}
                  </button>
                  <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest">Secure 256-bit Encrypted Transaction</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'members':
        if (!membershipId) {
          return (
            <div className="pt-32 pb-20 px-4 flex flex-col items-center justify-center min-h-[70vh]">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-6 animate-bounce">
                <Lock size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t.lockedContent}</h2>
              <p className="text-zinc-500 text-center animate-pulse">{t.redirectMsg}</p>
            </div>
          );
        }
        return (
          <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-b from-emerald-950/20 to-black rounded-[3rem] p-12 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-emerald-900 opacity-20 rotate-12">
                <ShieldCheck size={160} />
              </div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4">Welcome, Elite Member</h2>
                <div className="inline-block px-4 py-1 bg-amber-500/20 text-amber-500 rounded-full text-sm font-mono mb-8">
                   ID: {membershipId}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  <div className="bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800 text-left">
                    <h3 className="text-xl font-bold text-white mb-2">Member Portal</h3>
                    <p className="text-zinc-500 text-sm mb-6">Manage your joint ventures and view exclusive leads.</p>
                    <button className="w-full py-3 bg-zinc-800 text-zinc-300 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-700">
                      Dashboard <ExternalLink size={16} />
                    </button>
                  </div>
                  
                  <div className="bg-blue-600/10 p-8 rounded-3xl border border-blue-500/30 text-left">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">Telegram Group</h3>
                    <p className="text-zinc-400 text-sm mb-6">Connect instantly with our $100M+ network of leaders.</p>
                    <a 
                      href="https://t.me/techwealth_exclusive" 
                      target="_blank"
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                    >
                      {t.telegramBtn}
                    </a>
                  </div>
                </div>
                
                <div className="mt-12 pt-12 border-t border-zinc-800">
                  <h4 className="text-zinc-500 uppercase tracking-[0.3em] text-xs font-bold mb-6">Active Chapters</h4>
                  <div className="flex flex-wrap justify-center gap-4">
                    {['Hong Kong', 'Singapore', 'London', 'Dubai', 'Zürich', 'New York'].map(city => (
                      <span key={city} className="px-4 py-1 bg-zinc-900 text-zinc-400 rounded-full text-xs border border-zinc-800">{city}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        lang={lang} 
        setLang={setLang}
        isMember={!!membershipId}
      />
      
      <main className="animate-in fade-in duration-700">
        {renderContent()}
      </main>

      <footer className="border-t border-zinc-900 py-10 text-center">
        <p className="text-zinc-600 text-xs tracking-widest uppercase">
          © 2024 TechWealth Collective. Privileged & Confidential.
        </p>
      </footer>
    </div>
  );
};

export default App;

