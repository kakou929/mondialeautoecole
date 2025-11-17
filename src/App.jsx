import './firebase';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, getDocs, increment, deleteDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Award, Trophy, ArrowLeft, User, LogOut, CreditCard, FileText, Users, Send, BarChart3, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import './App.css';
import femmeVolant from './assets/femme-volant.jpg';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('welcome');
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount] = useState(75000);
  const [waveNumber, setWaveNumber] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUserForMessage, setSelectedUserForMessage] = useState(null);
  const [messageText, setMessageText] = useState('');
  
  // NOUVEAUX ÉTATS ADMIN
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const ADMIN_SECRET_CODE = 'MONDIALE2024'; // Code administrateur secret
  
  // ÉTATS RÉSERVATION
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [reservations, setReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  
  const [panneaux] = useState([
    // PANNEAUX GRATUITS (10)
    { id: 1, nom: "Virage dangereux à droite", categorie: "danger", fichier: "./assets/img01.jpg", gratuit: true },
    { id: 2, nom: "Stop", categorie: "obligation", fichier: "./assets/stop.jpg", gratuit: true },
    { id: 3, nom: "Cédez le passage", categorie: "obligation", fichier: "./assets/cedez.jpg", gratuit: true },
    { id: 4, nom: "Sens interdit", categorie: "interdiction", fichier: "./assets/sens-interdit.jpg", gratuit: true },
    { id: 5, nom: "Limitation 50 km/h", categorie: "interdiction", fichier: "./assets/limite-50.jpg", gratuit: true },
    { id: 6, nom: "Passage piétons", categorie: "danger", fichier: "./assets/passage-pietons.jpg", gratuit: true },
    { id: 7, nom: "Priorité à droite", categorie: "danger", fichier: "./assets/priorite-droite.jpg", gratuit: true },
    { id: 8, nom: "Rond-point", categorie: "indication", fichier: "./assets/rond-point.jpg", gratuit: true },
    { id: 9, nom: "Stationnement interdit", categorie: "interdiction", fichier: "./assets/stationnement.jpg", gratuit: true },
    { id: 10, nom: "Feux tricolores", categorie: "indication", fichier: "./assets/feux.jpg", gratuit: true },

    // PANNEAUX PREMIUM - DANGER
    { id: 11, nom: "Chaussée rétrécie à droite", categorie: "danger", fichier: "./assets/choretdro.jpg", gratuit: false },
    { id: 12, nom: "Chaussée rétrécie", categorie: "danger", fichier: "./assets/choretprin.jpg", gratuit: false },
    { id: 13, nom: "Double virage à gauche", categorie: "danger", fichier: "./assets/double-goc.jpg", gratuit: false },
    { id: 14, nom: "Double virage à droite", categorie: "danger", fichier: "./assets/doub_droi.jpg", gratuit: false },
    { id: 15, nom: "Débouché sur quai", categorie: "danger", fichier: "./assets/debouche.jpg", gratuit: false },
    { id: 16, nom: "Dos d'âne", categorie: "danger", fichier: "./assets/dos.jpg", gratuit: false },
    { id: 17, nom: "Virages successifs", categorie: "danger", fichier: "./assets/im1.jpg", gratuit: false },
    { id: 18, nom: "Descente dangereuse", categorie: "danger", fichier: "./assets/descente.jpg", gratuit: false },
    { id: 19, nom: "Intersection", categorie: "danger", fichier: "./assets/intersection.jpg", gratuit: false },
    { id: 20, nom: "Travaux", categorie: "danger", fichier: "./assets/travaux.jpg", gratuit: false },

    // PANNEAUX PREMIUM - INTERDICTION
    { id: 21, nom: "Interdiction de tourner à gauche", categorie: "interdiction", fichier: "./assets/interdit-gauche.jpg", gratuit: false },
    { id: 22, nom: "Interdiction de tourner à droite", categorie: "interdiction", fichier: "./assets/interdit-droite.jpg", gratuit: false },
    { id: 23, nom: "Interdiction de faire demi-tour", categorie: "interdiction", fichier: "./assets/demi-tour.jpg", gratuit: false },
    { id: 24, nom: "Limitation 30 km/h", categorie: "interdiction", fichier: "./assets/limite-30.jpg", gratuit: false },
    { id: 25, nom: "Limitation 70 km/h", categorie: "interdiction", fichier: "./assets/limite-70.jpg", gratuit: false },
    { id: 26, nom: "Interdiction aux poids lourds", categorie: "interdiction", fichier: "./assets/poids-lourds.jpg", gratuit: false },
    { id: 27, nom: "Interdiction de klaxonner", categorie: "interdiction", fichier: "./assets/klaxon.jpg", gratuit: false },
    { id: 28, nom: "Arrêt interdit", categorie: "interdiction", fichier: "./assets/arret-interdit.jpg", gratuit: false },

    // PANNEAUX PREMIUM - OBLIGATION
    { id: 29, nom: "Direction obligatoire à droite", categorie: "obligation", fichier: "./assets/oblig-droite.jpg", gratuit: false },
    { id: 30, nom: "Direction obligatoire à gauche", categorie: "obligation", fichier: "./assets/oblig-gauche.jpg", gratuit: false },
    { id: 31, nom: "Contournement obligatoire", categorie: "obligation", fichier: "./assets/contourner.jpg", gratuit: false },
    { id: 32, nom: "Piste cyclable obligatoire", categorie: "obligation", fichier: "./assets/piste-cyclable.jpg", gratuit: false },
    { id: 33, nom: "Chaînes obligatoires", categorie: "obligation", fichier: "./assets/chaines.jpg", gratuit: false },

    // PANNEAUX PREMIUM - INDICATION
    { id: 34, nom: "Parking", categorie: "indication", fichier: "./assets/parking.jpg", gratuit: false },
    { id: 35, nom: "Hôpital", categorie: "indication", fichier: "./assets/hopital.jpg", gratuit: false },
    { id: 36, nom: "Station service", categorie: "indication", fichier: "./assets/station.jpg", gratuit: false },
    { id: 37, nom: "Téléphone", categorie: "indication", fichier: "./assets/telephone.jpg", gratuit: false },
    { id: 38, nom: "Restaurant", categorie: "indication", fichier: "./assets/restaurant.jpg", gratuit: false },
    { id: 39, nom: "Hôtel", categorie: "indication", fichier: "./assets/hotel.jpg", gratuit: false },
    { id: 40, nom: "Aire de repos", categorie: "indication", fichier: "./assets/repos.jpg", gratuit: false }
  ]);

  // 50 QUIZ COMPLETS - CODE IVOIRIEN ET INTERNATIONAL
  const QUIZ_PREMIUM = [
    // 20 QUIZ GRATUITS
    {
      id: 'q1',
      question: "À quelle distance minimale doit-on s'arrêter d'un passage piéton en Côte d'Ivoire ?",
      reponses: ["3 mètres", "5 mètres", "7 mètres", "10 mètres"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q2',
      question: "Quelle est la vitesse maximale en agglomération en Côte d'Ivoire ?",
      reponses: ["30 km/h", "50 km/h", "60 km/h", "70 km/h"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q3',
      question: "Que signifie un feu orange ?",
      reponses: ["Accélérer pour passer", "S'arrêter si possible", "Ralentir légèrement", "Continuer normalement"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q4',
      question: "À partir de quel taux d'alcoolémie est-on en infraction en Côte d'Ivoire ?",
      reponses: ["0.2 g/L", "0.5 g/L", "0.8 g/L", "1.0 g/L"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q5',
      question: "Quelle distance de sécurité doit-on respecter sur autoroute ?",
      reponses: ["50 mètres", "100 mètres", "Distance parcourue en 2 secondes", "5 secondes"],
      correcte: 2,
      type: "gratuit"
    },
    {
      id: 'q6',
      question: "Un panneau triangulaire avec bordure rouge indique :",
      reponses: ["Une interdiction", "Un danger", "Une obligation", "Une indication"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q7',
      question: "Le port de la ceinture de sécurité est obligatoire :",
      reponses: ["En ville uniquement", "Sur autoroute uniquement", "Partout", "Pour le conducteur seulement"],
      correcte: 2,
      type: "gratuit"
    },
    {
      id: 'q8',
      question: "Que doit-on faire à un panneau STOP ?",
      reponses: ["Ralentir seulement", "Marquer l'arrêt complet", "Céder le passage sans s'arrêter", "Regarder et continuer"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q9',
      question: "Une ligne blanche continue au centre de la chaussée signifie :",
      reponses: ["On peut la franchir pour doubler", "Interdiction absolue de la franchir", "On peut la franchir en cas d'urgence", "Simple indication"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q10',
      question: "Dans un rond-point, à qui doit-on céder le passage ?",
      reponses: ["À gauche", "À droite", "Aux véhicules déjà dans le rond-point", "Personne, priorité au premier"],
      correcte: 2,
      type: "gratuit"
    },
    {
      id: 'q11',
      question: "La durée de validité du permis probatoire en Côte d'Ivoire est de :",
      reponses: ["6 mois", "1 an", "2 ans", "3 ans"],
      correcte: 3,
      type: "gratuit"
    },
    {
      id: 'q12',
      question: "Les feux de brouillard avant peuvent être utilisés :",
      reponses: ["Toujours", "Par visibilité réduite uniquement", "La nuit seulement", "Jamais"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q13',
      question: "Un panneau carré bleu avec pictogramme blanc indique :",
      reponses: ["Un danger", "Une obligation", "Une indication", "Une interdiction"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q14',
      question: "L'âge minimum pour passer le permis de conduire en Côte d'Ivoire est :",
      reponses: ["16 ans", "17 ans", "18 ans", "21 ans"],
      correcte: 2,
      type: "gratuit"
    },
    {
      id: 'q15',
      question: "Sur une route à priorité, on doit :",
      reponses: ["S'arrêter systématiquement", "Ralentir à 30 km/h", "Continuer prudemment", "Accélérer"],
      correcte: 2,
      type: "gratuit"
    },
    {
      id: 'q16',
      question: "L'utilisation du téléphone portable au volant en conduisant est :",
      reponses: ["Autorisée avec kit mains libres", "Totalement interdite", "Autorisée à l'arrêt moteur éteint", "Autorisée en ville"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q17',
      question: "En cas de pluie, la distance de freinage :",
      reponses: ["Diminue de 30%", "Reste identique", "Augmente considérablement", "Dépend uniquement de la vitesse"],
      correcte: 2,
      type: "gratuit"
    },
    {
      id: 'q18',
      question: "Un triangle de présignalisation doit être placé à quelle distance du véhicule en panne ?",
      reponses: ["10 mètres", "30 mètres minimum", "50 mètres exactement", "100 mètres"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q19',
      question: "Le contrôle technique des véhicules est obligatoire tous les :",
      reponses: ["1 an", "2 ans", "3 ans", "5 ans"],
      correcte: 1,
      type: "gratuit"
    },
    {
      id: 'q20',
      question: "Avant de démarrer, le conducteur doit obligatoirement :",
      reponses: ["Klaxonner", "Vérifier les rétroviseurs et angles morts", "Allumer les feux de détresse", "Accélérer progressivement"],
      correcte: 1,
      type: "gratuit"
    },

    // 30 QUIZ PREMIUM
    {
      id: 'q21',
      question: "La vitesse maximale sur autoroute en Côte d'Ivoire est de :",
      reponses: ["90 km/h", "110 km/h", "120 km/h", "130 km/h"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q22',
      question: "Un véhicule qui circule avec un feu de position défectueux la nuit risque :",
      reponses: ["Une simple remarque", "Une amende de 5000 FCFA", "Une amende de 25000 FCFA", "L'immobilisation du véhicule"],
      correcte: 3,
      type: "premium"
    },
    {
      id: 'q23',
      question: "Le dépassement par la droite est autorisé :",
      reponses: ["Jamais", "En agglomération uniquement", "Quand la file de gauche est à l'arrêt", "Sur autoroute seulement"],
      correcte: 2,
      type: "premium"
    },
    {
      id: 'q24',
      question: "À l'approche d'un passage à niveau avec barrières fermées, vous devez :",
      reponses: ["Passer rapidement avant la fermeture", "Vous arrêter à 5m des barrières", "Klaxonner et passer", "Attendre l'ouverture des barrières"],
      correcte: 3,
      type: "premium"
    },
    {
      id: 'q25',
      question: "Le port du casque pour les conducteurs de deux-roues est obligatoire :",
      reponses: ["Sur autoroute uniquement", "En ville uniquement", "Partout", "Au choix du conducteur"],
      correcte: 2,
      type: "premium"
    },
    {
      id: 'q26',
      question: "En cas d'accident avec blessés, la première action est de :",
      reponses: ["Déplacer les blessés", "Sécuriser les lieux", "Appeler la police", "Prendre des photos"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q27',
      question: "La distance d'arrêt d'un véhicule comprend :",
      reponses: ["Uniquement la distance de freinage", "Distance de réaction + distance de freinage", "La distance parcourue en 2 secondes", "50 mètres minimum"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q28',
      question: "Un conducteur qui refuse de se soumettre à un alcootest risque :",
      reponses: ["Une simple amende", "Suspension du permis 3 mois", "Retrait du permis", "Emprisonnement possible"],
      correcte: 3,
      type: "premium"
    },
    {
      id: 'q29',
      question: "Les feux de route doivent être baissés à l'approche d'un véhicule à :",
      reponses: ["50 mètres", "100 mètres", "150 mètres", "200 mètres"],
      correcte: 2,
      type: "premium"
    },
    {
      id: 'q30',
      question: "Un enfant de moins de 10 ans doit être installé :",
      reponses: ["À l'avant avec ceinture", "À l'arrière sans ceinture", "À l'arrière avec dispositif adapté", "Au choix des parents"],
      correcte: 2,
      type: "premium"
    },
    {
      id: 'q31',
      question: "Le stationnement est interdit à moins de combien de mètres d'une intersection ?",
      reponses: ["3 mètres", "5 mètres", "10 mètres", "15 mètres"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q32',
      question: "En cas de panne sur autoroute, vous devez :",
      reponses: ["Rester dans le véhicule", "Sortir par le côté droit et se mettre derrière la glissière", "Réparer immédiatement", "Attendre les secours dans le véhicule"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q33',
      question: "La durée maximale de conduite sans pause est de :",
      reponses: ["2 heures", "3 heures", "4 heures", "5 heures"],
      correcte: 2,
      type: "premium"
    },
    {
      id: 'q34',
      question: "À un carrefour sans signalisation, la priorité est :",
      reponses: ["Au véhicule venant de gauche", "Au véhicule venant de droite", "Au premier arrivé", "Au véhicule le plus rapide"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q35',
      question: "Le changement de direction doit être signalé :",
      reponses: ["Au moment de tourner", "50 mètres avant", "100 mètres avant sur autoroute", "Après avoir commencé la manœuvre"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q36',
      question: "Un véhicule en stationnement doit être visible à :",
      reponses: ["50 mètres", "100 mètres", "150 mètres", "200 mètres"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q37',
      question: "Les pneus d'un véhicule doivent avoir une profondeur de sculpture d'au moins :",
      reponses: ["0.8 mm", "1.2 mm", "1.6 mm", "2.0 mm"],
      correcte: 2,
      type: "premium"
    },
    {
      id: 'q38',
      question: "En cas de verglas, la vitesse doit être réduite de :",
      reponses: ["20%", "30%", "50%", "70%"],
      correcte: 2,
      type: "premium"
    },
    {
      id: 'q39',
      question: "Un conducteur novice doit apposer un disque 'A' pendant :",
      reponses: ["6 mois", "1 an", "2 ans", "3 ans"],
      correcte: 3,
      type: "premium"
    },
    {
      id: 'q40',
      question: "Le contrôle de la pression des pneus doit se faire :",
      reponses: ["À chaud", "À froid", "Indifféremment", "Après 100 km"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q41',
      question: "En zone urbaine, le klaxon ne peut être utilisé que :",
      reponses: ["Librement", "En cas de danger immédiat", "Pour saluer", "La nuit uniquement"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q42',
      question: "La charge maximale d'un véhicule ne doit pas dépasser :",
      reponses: ["Le PTAC indiqué", "500 kg", "1000 kg", "Au jugement du conducteur"],
      correcte: 0,
      type: "premium"
    },
    {
      id: 'q43',
      question: "Les feux de détresse doivent être allumés en cas de :",
      reponses: ["Pluie forte", "Panne ou danger", "Conduite lente", "Stationnement interdit"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q44',
      question: "Un véhicule qui circule de nuit sans éclairage risque :",
      reponses: ["Une amende simple", "Immobilisation du véhicule", "Retrait de points", "Avertissement"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q45',
      question: "La vitesse en zone résidentielle est limitée à :",
      reponses: ["20 km/h", "30 km/h", "40 km/h", "50 km/h"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q46',
      question: "Le dépassement est interdit à moins de combien de mètres d'un sommet de côte ?",
      reponses: ["50 mètres", "100 mètres", "150 mètres", "200 mètres"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q47',
      question: "L'assurance responsabilité civile couvre :",
      reponses: ["Uniquement le conducteur", "Les dommages causés aux tiers", "Tous les dommages", "Le véhicule uniquement"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q48',
      question: "En cas de brouillard, il faut utiliser :",
      reponses: ["Les feux de route", "Les feux de croisement et antibrouillard", "Uniquement les antibrouillard", "Les feux de position"],
      correcte: 1,
      type: "premium"
    },
    {
      id: 'q49',
      question: "La vignette d'assurance doit être apposée :",
      reponses: ["Sur le pare-brise avant", "Sur le pare-brise arrière", "Dans la boîte à gants", "Au rétroviseur"],
      correcte: 0,
      type: "premium"
    },
    {
      id: 'q50',
      question: "Un conducteur en état d'ébriété risque :",
      reponses: ["Une simple amende", "Suspension du permis", "Emprisonnement et amende", "Avertissement"],
      correcte: 2,
      type: "premium"
    }
  ];

  const QUIZ_GRATUITS = QUIZ_PREMIUM.filter(q => q.type === "gratuit");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          // Charger les réservations de l'utilisateur
          await loadUserReservations(user.uid);
        }
        setCurrentPage('home');
      } else {
        setCurrentUser(null);
        setUserData(null);
        setCurrentPage('welcome');
      }
    });
    return unsubscribe;
  }, []);

  const loadAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersData);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const loadUserReservations = async (userId) => {
    try {
      const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
      const userReservations = reservationsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(res => res.userId === userId);
      setReservations(userReservations);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    }
  };

  const loadAllReservations = async () => {
    try {
      const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
      const allRes = reservationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllReservations(allRes);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    }
  };

  // Fonction pour tracker la vue des panneaux
  const trackPanneauxView = async () => {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        panneauxViewCount: increment(1),
        lastPanneauxView: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur tracking panneaux:', error);
    }
  };

  // Fonction pour tracker le quiz complété
  const trackQuizCompleted = async (quizScore, quizTotal) => {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        quizCompletedCount: increment(1),
        lastQuizScore: quizScore,
        lastQuizTotal: quizTotal,
        lastQuizDate: serverTimestamp()
      });
      
      // Recharger les données utilisateur
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Erreur tracking quiz:', error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !nom || !prenom) {
      alert('❌ Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      alert('❌ Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, 'users', userId), {
        email: email,
        nom: nom,
        prenom: prenom,
        createdAt: serverTimestamp(),
        isPremium: false,
        isMoniteur: false,
        coursCompleted: 0,
        quizCompleted: 0,
        quizCompletedCount: 0,
        panneauxViewCount: 0,
        versement1: false,
        versement2: false,
        totalPaid: 0,
        messages: []
      });

      alert('✅ Compte créé avec succès !');
      setCurrentPage('home');
      setEmail('');
      setPassword('');
      setNom('');
      setPrenom('');
      
    } catch (error) {
      console.error('Erreur:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        alert('❌ Cet email est déjà utilisé');
      } else if (error.code === 'auth/invalid-email') {
        alert('❌ Email invalide');
      } else {
        alert('❌ Erreur: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('❌ Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('✅ Connexion réussie !');
      setCurrentPage('home');
      setEmail('');
      setPassword('');
      
    } catch (error) {
      console.error('Erreur:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        alert('❌ Email ou mot de passe incorrect');
      } else {
        alert('❌ Erreur: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdminAuthenticated(false);
      setCurrentPage('welcome');
      alert('✅ Déconnexion réussie');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const handleAdminLogin = () => {
    if (adminCode === ADMIN_SECRET_CODE) {
      setIsAdminAuthenticated(true);
      setShowAdminLogin(false);
      setAdminCode('');
      goToAdmin();
    } else {
      alert('❌ Code administrateur incorrect');
      setAdminCode('');
    }
  };

  const handlePayment = async () => {
    if (!waveNumber || waveNumber.length < 10) {
      alert('❌ Veuillez entrer un numéro Wave valide');
      return;
    }

    setLoading(true);
    
    try {
      const versementField = userData.versement1 ? 'versement2' : 'versement1';
      const newTotalPaid = (userData.totalPaid || 0) + paymentAmount;
      const isPremiumNow = newTotalPaid >= 75000;
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        [versementField]: true,
        totalPaid: newTotalPaid,
        isPremium: isPremiumNow,
        lastPaymentDate: serverTimestamp()
      });

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      setUserData(userDoc.data());

      alert(`✅ Paiement de ${paymentAmount.toLocaleString()} FCFA enregistré via Wave !\n${isPremiumNow ? '🎉 Accès Premium activé !' : ''}`);
      setShowPaymentModal(false);
      setWaveNumber('');
      
    } catch (error) {
      console.error('Erreur paiement:', error);
      alert('❌ Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert('❌ Veuillez entrer un message');
      return;
    }

    setLoading(true);
    
    try {
      const userRef = doc(db, 'users', selectedUserForMessage.id);
      const userDoc = await getDoc(userRef);
      const currentMessages = userDoc.data().messages || [];
      
      const newMessage = {
        text: messageText,
        from: 'Moniteur',
        date: new Date().toISOString(),
        read: false
      };
      
      await updateDoc(userRef, {
        messages: [...currentMessages, newMessage]
      });

      alert('✅ Message envoyé avec succès !');
      setShowMessageModal(false);
      setMessageText('');
      setSelectedUserForMessage(null);
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('❌ Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async () => {
    if (!reservationDate || !reservationTime) {
      alert('❌ Veuillez sélectionner une date et une heure');
      return;
    }

    if (!userData?.isPremium) {
      alert('❌ Vous devez être membre Premium pour réserver une séance de conduite');
      return;
    }

    setLoading(true);
    
    try {
      const reservationId = `res_${Date.now()}`;
      await setDoc(doc(db, 'reservations', reservationId), {
        userId: currentUser.uid,
        userName: `${userData.prenom} ${userData.nom}`,
        userEmail: userData.email,
        date: reservationDate,
        time: reservationTime,
        status: 'en attente',
        createdAt: serverTimestamp()
      });

      alert('✅ Réservation créée avec succès ! En attente de confirmation.');
      setShowReservationModal(false);
      setReservationDate('');
      setReservationTime('');
      await loadUserReservations(currentUser.uid);
      
    } catch (error) {
      console.error('Erreur création réservation:', error);
      alert('❌ Erreur lors de la création de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReservationStatus = async (reservationId, newStatus) => {
    setLoading(true);
    
    try {
      await updateDoc(doc(db, 'reservations', reservationId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      alert(`✅ Réservation ${newStatus === 'confirmée' ? 'confirmée' : 'annulée'} !`);
      await loadAllReservations();
      
    } catch (error) {
      console.error('Erreur mise à jour réservation:', error);
      alert('❌ Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      return;
    }

    setLoading(true);
    
    try {
      await deleteDoc(doc(db, 'reservations', reservationId));
      alert('✅ Réservation supprimée');
      await loadUserReservations(currentUser.uid);
    } catch (error) {
      console.error('Erreur suppression réservation:', error);
      alert('❌ Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (isPremium = false) => {
    if (isPremium && !userData?.isPremium) {
      alert('❌ Accès réservé aux membres Premium');
      return;
    }
    
    setCurrentPage('quiz');
    setCurrentQuiz(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (indexReponse) => {
    const quizData = userData?.isPremium ? QUIZ_PREMIUM : QUIZ_GRATUITS;
    setSelectedAnswer(indexReponse);
    setShowResult(true);
    
    if (indexReponse === quizData[currentQuiz].correcte) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    const quizData = userData?.isPremium ? QUIZ_PREMIUM : QUIZ_GRATUITS;
    if (currentQuiz < quizData.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz terminé - tracker l'activité
      trackQuizCompleted(score + (selectedAnswer === quizData[currentQuiz].correcte ? 1 : 0), quizData.length);
      setQuizFinished(true);
    }
  };

  const goHome = () => {
    setCurrentPage('home');
    setCurrentQuiz(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const goToWelcome = () => {
    setCurrentPage('welcome');
  };

  const goToAuth = () => {
    setCurrentPage('auth');
  };

  const goToAdmin = async () => {
    if (!isAdminAuthenticated) {
      setShowAdminLogin(true);
      return;
    }
    
    await loadAllUsers();
    await loadAllReservations();
    setCurrentPage('admin');
  };

  const goToPanneaux = () => {
    // Tracker la vue des panneaux
    trackPanneauxView();
    setCurrentPage('panneaux');
  };

  // PAGE BIENVENUE
  if (currentPage === 'welcome') {
    const panneauxGratuits = panneaux.filter(p => p.gratuit);
    
    return (
      <div className="app">
        <nav className="welcome-nav-minimal">
          <div className="nav-content-minimal">
            <div className="logo-ornikar">
              <span className="logo-m">M</span>
              <span className="logo-text">ondiale</span>
            </div>
            <button className="btn-admin-access" onClick={() => setShowAdminLogin(true)}>
              🔐 Admin
            </button>
          </div>
        </nav>

        <div className="hero-minimal">
          <div className="hero-content-wrapper">
            <div className="hero-text-section">
              <h1 className="hero-title-main">Passez votre permis de conduire chez nous</h1>
              <p className="hero-subtitle">Apprends ton code de la route en ligne. Mondiale est une auto-école agréée par l'état.</p>
              <button className="btn-hero-cta" onClick={goToAuth}>
                Inscription
              </button>
            </div>
            <div className="hero-image-section">
              <div className="hero-image-semicircle">
                <img src={femmeVolant} alt="Femme au volant" className="hero-image" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Info */}
        <div className="info-section">
          <div className="info-container">
            <h2 className="section-title">Pourquoi choisir Mondiale Auto-École ?</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">✅</div>
                <h3>Agréée par l'État</h3>
                <p>École de conduite officielle reconnue par le ministère des transports</p>
              </div>
              <div className="info-card">
                <div className="info-icon">👨‍🏫</div>
                <h3>Moniteurs Qualifiés</h3>
                <p>Équipe de moniteurs expérimentés et pédagogues</p>
              </div>
              <div className="info-card">
                <div className="info-icon">📱</div>
                <h3>Formation en Ligne</h3>
                <p>Apprends le code à ton rythme, où tu veux, quand tu veux</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🚗</div>
                <h3>Conduite Pratique</h3>
                <p>Véhicules récents et bien entretenus pour ta formation</p>
              </div>
            </div>
          </div>
        </div>

        <div className="formations-section">
          <h2 className="section-title">Nos Offres de Formation</h2>
          
          <div className="formations-grid">
            <div className="formation-card-large">
              <div className="formation-icon">📝</div>
              <h3>Offre Gratuite</h3>
              <p className="formation-desc">20 quiz d'entraînement pour tester vos connaissances</p>
              <div className="formation-price">Gratuit</div>
              <button className="btn-formation" onClick={goToAuth}>
                Faire un test
              </button>
            </div>

            <div className="formation-card-large featured-card">
              <div className="badge-popular">Recommandé</div>
              <div className="formation-icon">🎓</div>
              <h3>Inscris-toi pour faire ton permis</h3>
              <p className="formation-desc">50 quiz complets + suivi moniteur + cours pratique</p>
              
              <div className="payment-details">
                <div className="payment-item">
                  <CreditCard size={18} />
                  <span>1er versement: 75,000 FCFA</span>
                </div>
                <div className="payment-item">
                  <CreditCard size={18} />
                  <span>2ème versement: 75,000 FCFA</span>
                </div>
                <div className="payment-wave">
                  💳 Paiement via Wave accepté
                </div>
              </div>
              
              <div className="formation-price">Total: 150,000 FCFA</div>
              
              <div className="documents-section">
                <h4><FileText size={16} /> Documents à fournir</h4>
                <p>• Une pièce d'identité pour les nationaux</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Panneaux gratuits */}
        <div className="panneaux-section">
          <h2 className="section-title">Panneaux de signalisation</h2>
          <p className="section-subtitle">Découvrez quelques panneaux essentiels</p>
          <div className="panneaux-grid">
            {panneauxGratuits.map((panneau) => (
              <div className="panneau-card" key={panneau.id}>
                <div className="panneau-image-container">
                  <img 
                    src={panneau.fichier}
                    alt={panneau.nom}
                    className="panneau-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="panneau-placeholder">🚦</div>';
                    }}
                  />
                </div>
                <h3>{panneau.nom}</h3>
                <span className="panneau-categorie">{panneau.categorie}</span>
              </div>
            ))}
          </div>
          <button className="btn-voir-plus" onClick={goToAuth}>
            Voir tous les panneaux (Premium)
          </button>
        </div>

        <div className="contact-section">
          <div className="contact-container">
            <h2>Contactez-nous</h2>
            <div className="contact-info">
              <p>📞 +225 07 88 00 53 32 (numéro unique)</p>
              <p>📍 Abidjan, Côte d'Ivoire</p>
            </div>
          </div>
        </div>

        {/* Modal de connexion Admin */}
        {showAdminLogin && (
          <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>🔐 Accès Administrateur</h2>
              <p>Entrez le code administrateur secret</p>
              
              <input
                type="password"
                placeholder="Code administrateur"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="auth-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              
              <div className="modal-buttons">
                <button onClick={handleAdminLogin} className="btn-confirm">
                  Se connecter
                </button>
                <button onClick={() => {
                  setShowAdminLogin(false);
                  setAdminCode('');
                }} className="btn-cancel">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PAGE PANNEAUX (PREMIUM avec catégories)
  if (currentPage === 'panneaux') {
    if (!userData?.isPremium) {
      return (
        <div className="app">
          <div className="premium-required">
            <h1>🔒 Accès Premium Requis</h1>
            <p>Cette section est réservée aux membres Premium</p>
            <button onClick={goHome} className="btn-back-home">Retour</button>
          </div>
        </div>
      );
    }

    const panneauxParCategorie = {
      danger: panneaux.filter(p => p.categorie === "danger"),
      interdiction: panneaux.filter(p => p.categorie === "interdiction"),
      obligation: panneaux.filter(p => p.categorie === "obligation"),
      indication: panneaux.filter(p => p.categorie === "indication")
    };

    return (
      <div className="app">
        <nav className="welcome-nav-minimal">
          <div className="nav-content-minimal">
            <div className="logo-ornikar" onClick={goHome} style={{cursor: 'pointer'}}>
              <span className="logo-m">M</span>
              <span className="logo-text">ondiale</span>
            </div>
            <button className="btn-back-simple" onClick={goHome}>
              <ArrowLeft size={20} />
            </button>
          </div>
        </nav>

        <div className="panneaux-page">
          <h1>📚 Tous les Panneaux de Signalisation</h1>
          <p className="panneaux-subtitle">Apprenez à reconnaître tous les panneaux de la route</p>
          
          {/* Panneaux de DANGER */}
          <div className="panneaux-category-section">
            <h2 className="category-title">⚠️ Panneaux de Danger</h2>
            <div className="panneaux-grid-full">
              {panneauxParCategorie.danger.map((panneau) => (
                <div className="panneau-card-detailed" key={panneau.id}>
                  <div className="panneau-image-placeholder-large">
                    <img
                      className="panneau-icon-large"
                      src={panneau.fichier}
                      alt={panneau.nom}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="panneau-placeholder-large">⚠️</div>';
                      }}
                    />
                  </div>
                  <div className="panneau-info">
                    <h3>{panneau.nom}</h3>
                    <span className="badge-danger">Danger</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panneaux d'INTERDICTION */}
          <div className="panneaux-category-section">
            <h2 className="category-title">🚫 Panneaux d'Interdiction</h2>
            <div className="panneaux-grid-full">
              {panneauxParCategorie.interdiction.map((panneau) => (
                <div className="panneau-card-detailed" key={panneau.id}>
                  <div className="panneau-image-placeholder-large">
                    <img
                      className="panneau-icon-large"
                      src={panneau.fichier}
                      alt={panneau.nom}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="panneau-placeholder-large">🚫</div>';
                      }}
                    />
                  </div>
                  <div className="panneau-info">
                    <h3>{panneau.nom}</h3>
                    <span className="badge-interdiction">Interdiction</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panneaux d'OBLIGATION */}
          <div className="panneaux-category-section">
            <h2 className="category-title">🔵 Panneaux d'Obligation</h2>
            <div className="panneaux-grid-full">
              {panneauxParCategorie.obligation.map((panneau) => (
                <div className="panneau-card-detailed" key={panneau.id}>
                  <div className="panneau-image-placeholder-large">
                    <img
                      className="panneau-icon-large"
                      src={panneau.fichier}
                      alt={panneau.nom}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="panneau-placeholder-large">🔵</div>';
                      }}
                    />
                  </div>
                  <div className="panneau-info">
                    <h3>{panneau.nom}</h3>
                    <span className="badge-obligation">Obligation</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panneaux d'INDICATION */}
          <div className="panneaux-category-section">
            <h2 className="category-title">ℹ️ Panneaux d'Indication</h2>
            <div className="panneaux-grid-full">
              {panneauxParCategorie.indication.map((panneau) => (
                <div className="panneau-card-detailed" key={panneau.id}>
                  <div className="panneau-image-placeholder-large">
                    <img
                      className="panneau-icon-large"
                      src={panneau.fichier}
                      alt={panneau.nom}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="panneau-placeholder-large">ℹ️</div>';
                      }}
                    />
                  </div>
                  <div className="panneau-info">
                    <h3>{panneau.nom}</h3>
                    <span className="badge-indication">Indication</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE AUTH
  if (currentPage === 'auth') {
    return (
      <div className="app">
        <div className="auth-page">
          <div className="auth-card">
            <button onClick={goToWelcome} className="btn-back-page">
              <ArrowLeft size={20} />
              Retour à l'accueil
            </button>

            <div className="auth-logo">
              <div className="logo-ornikar">
                <span className="logo-m">M</span>
                <span className="logo-text">ondiale</span>
              </div>
              <p>Votre permis en ligne</p>
            </div>

            <div className="auth-tabs">
              <button 
                className={isLogin ? 'auth-tab active' : 'auth-tab'} 
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button 
                className={!isLogin ? 'auth-tab active' : 'auth-tab'} 
                onClick={() => setIsLogin(false)}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="auth-form">
              {!isLogin && (
                <>
                  <input
                    type="text"
                    placeholder="Nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    className="auth-input"
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                    className="auth-input"
                  />
                </>
              )}
              
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
              
              <input
                type="password"
                placeholder="Mot de passe (min 6 caractères)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />

              <button type="submit" disabled={loading} className="btn-auth-submit">
                {loading ? '⏳ Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // PAGE HOME
  if (currentPage === 'home') {
    return (
      <div className="app">
        <nav className="dashboard-nav">
          <div className="nav-container-dashboard">
            <div className="logo-ornikar">
              <span className="logo-m">M</span>
              <span className="logo-text">ondiale</span>
            </div>
            <div className="nav-user">
              <User size={18} />
              <span className="user-name">{userData?.nom} {userData?.prenom}</span>
              <button onClick={handleLogout} className="btn-logout-nav">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </nav>

        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Bienvenue {userData?.prenom} !</h1>
            {userData?.isPremium && (
              <div className="premium-badge-dashboard">
                <Award size={20} />
                <span>Membre Premium</span>
              </div>
            )}
          </div>

          {/* Stats utilisateur */}
          <div className="user-stats">
            <div className="stat-card">
              <BarChart3 size={30} />
              <div className="stat-info">
                <div className="stat-number">{userData?.quizCompletedCount || 0}</div>
                <div className="stat-label">Quiz complétés</div>
              </div>
            </div>
            <div className="stat-card">
              <FileText size={30} />
              <div className="stat-info">
                <div className="stat-number">{userData?.panneauxViewCount || 0}</div>
                <div className="stat-label">Vues panneaux</div>
              </div>
            </div>
            <div className="stat-card">
              <Calendar size={30} />
              <div className="stat-info">
                <div className="stat-number">{reservations.length}</div>
                <div className="stat-label">Réservations</div>
              </div>
            </div>
          </div>

          {/* Réservations de l'élève */}
          {userData?.isPremium && (
            <div className="reservations-user-section">
              <div className="section-header-with-btn">
                <h3>🚗 Mes réservations de conduite</h3>
                <button className="btn-add-reservation" onClick={() => setShowReservationModal(true)}>
                  <Calendar size={18} />
                  Nouvelle réservation
                </button>
              </div>
              
              {reservations.length > 0 ? (
                <div className="reservations-list">
                  {reservations.map((res) => (
                    <div key={res.id} className="reservation-card">
                      <div className="reservation-info">
                        <div className="reservation-date">
                          <Calendar size={20} />
                          <span>{new Date(res.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="reservation-time">
                          <Clock size={20} />
                          <span>{res.time}</span>
                        </div>
                        <div className={`reservation-status status-${res.status}`}>
                          {res.status === 'confirmée' && <CheckCircle size={18} />}
                          {res.status === 'annulée' && <XCircle size={18} />}
                          {res.status === 'en attente' && <Clock size={18} />}
                          <span>{res.status}</span>
                        </div>
                      </div>
                      {res.status === 'en attente' && (
                        <button 
                          className="btn-delete-reservation"
                          onClick={() => handleDeleteReservation(res.id)}
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reservations">Aucune réservation pour le moment</p>
              )}
            </div>
          )}

          {userData?.messages && userData.messages.length > 0 && (
            <div className="messages-container">
              <h3>📬 Messages de votre moniteur</h3>
              {userData.messages.map((msg, index) => (
                <div key={`msg-${index}`} className="message-card">
                  <div className="message-header">
                    <strong>{msg.from}</strong>
                    <span className="message-date">{new Date(msg.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="message-text">{msg.text}</p>
                </div>
              ))}
            </div>
          )}

          {userData?.isPremium && (
            <div className="payment-status-card">
              <h3>📊 Suivi des versements</h3>
              <div className="payment-progress">
                <div className="payment-step">
                  <div className={`payment-circle ${userData?.versement1 ? 'completed' : 'pending'}`}>
                    {userData?.versement1 ? '✓' : '1'}
                  </div>
                  <span>1er versement</span>
                  <span className="payment-amount">75,000 FCFA</span>
                </div>
                <div className="payment-line"></div>
                <div className="payment-step">
                  <div className={`payment-circle ${userData?.versement2 ? 'completed' : 'pending'}`}>
                    {userData?.versement2 ? '✓' : '2'}
                  </div>
                  <span>2ème versement</span>
                  <span className="payment-amount">75,000 FCFA</span>
                </div>
              </div>
              <div className="total-paid">
                Total payé: {(userData?.totalPaid || 0).toLocaleString()} FCFA / 150,000 FCFA
              </div>
            </div>
          )}

          <div className="dashboard-actions">
            <h2 style={{color: 'white', marginBottom: '25px'}}>Vos formations</h2>
            
            <div className="action-cards">
              <div className="action-card" onClick={() => startQuiz(false)}>
                <Trophy size={35} />
                <h3>Quiz Gratuits</h3>
                <p>20 questions d'entraînement</p>
                <button className="btn-action">Commencer</button>
              </div>

              <div className="action-card">
                <Award size={35} />
                <h3>Formation Complète</h3>
                <p>50 quiz + panneaux + suivi moniteur</p>
                {userData?.isPremium ? (
                  <>
                    <button className="btn-action btn-action-premium" onClick={() => startQuiz(true)}>
                      Accéder aux 50 quiz
                    </button>
                    <button className="btn-action" onClick={goToPanneaux} style={{marginTop: '10px'}}>
                      Voir les panneaux
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-action" onClick={() => setShowPaymentModal(true)}>
                      Payer via Wave
                    </button>
                    <small style={{marginTop: '10px', display: 'block'}}>
                      Premium dès 75,000 FCFA
                    </small>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de paiement */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>💳 Paiement via Wave</h2>
              <p>Montant: {paymentAmount.toLocaleString()} FCFA</p>
              <p className="payment-info">
                {userData?.versement1 ? '2ème versement' : '1er versement - Accès Premium immédiat'}
              </p>
              
              <input
                type="tel"
                placeholder="Numéro Wave (ex: 0707123456)"
                value={waveNumber}
                onChange={(e) => setWaveNumber(e.target.value)}
                className="wave-input"
                maxLength="10"
              />
              
              <div className="modal-buttons">
                <button onClick={handlePayment} disabled={loading} className="btn-confirm">
                  {loading ? 'Traitement...' : 'Confirmer le paiement'}
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="btn-cancel">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de réservation */}
        {showReservationModal && (
          <div className="modal-overlay" onClick={() => setShowReservationModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>🚗 Réserver une séance de conduite</h2>
              
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="auth-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label>Heure</label>
                <select
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="auth-input"
                >
                  <option value="">Sélectionner une heure</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
              
              <div className="modal-buttons">
                <button onClick={handleCreateReservation} disabled={loading} className="btn-confirm">
                  {loading ? 'Création...' : 'Confirmer'}
                </button>
                <button onClick={() => {
                  setShowReservationModal(false);
                  setReservationDate('');
                  setReservationTime('');
                }} className="btn-cancel">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PAGE ADMIN avec ACTIVITÉS ET RÉSERVATIONS
  if (currentPage === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <div className="app">
          <div className="access-denied">
            <h1>❌ Accès refusé</h1>
            <p>Vous devez vous authentifier en tant qu'administrateur</p>
            <button onClick={goHome} className="btn-back-home">Retour</button>
          </div>
        </div>
      );
    }

    return (
      <div className="app">
        <nav className="dashboard-nav">
          <div className="nav-container-dashboard">
            <div className="logo-ornikar">
              <span className="logo-m">M</span>
              <span className="logo-text">ondiale</span>
            </div>
            <div className="nav-user">
              <button onClick={goToWelcome} className="btn-back-nav">
                <ArrowLeft size={18} />
                Retour
              </button>
            </div>
          </div>
        </nav>

        <div className="admin-container">
          <h1>🔐 Tableau de bord Administrateur</h1>
          
          <div className="admin-stats">
            <div className="admin-stat-card">
              <h3>Total Élèves</h3>
              <div className="admin-stat-number">{allUsers.length}</div>
            </div>
            <div className="admin-stat-card">
              <h3>Membres Premium</h3>
              <div className="admin-stat-number">
                {allUsers.filter(u => u.isPremium).length}
              </div>
            </div>
            <div className="admin-stat-card">
              <h3>Quiz Total</h3>
              <div className="admin-stat-number">
                {allUsers.reduce((sum, u) => sum + (u.quizCompletedCount || 0), 0)}
              </div>
            </div>
            <div className="admin-stat-card">
              <h3>Réservations</h3>
              <div className="admin-stat-number">{allReservations.length}</div>
            </div>
          </div>

          {/* Section Réservations */}
          <div className="admin-reservations-section">
            <h2>📅 Gestion des Réservations de Conduite</h2>
            {allReservations.length > 0 ? (
              <div className="reservations-admin-grid">
                {allReservations.map((res) => (
                  <div key={res.id} className="reservation-admin-card">
                    <div className="reservation-admin-header">
                      <strong>{res.userName}</strong>
                      <span className={`reservation-status status-${res.status}`}>
                        {res.status}
                      </span>
                    </div>
                    <div className="reservation-admin-details">
                      <p><Calendar size={16} /> {new Date(res.date).toLocaleDateString('fr-FR')}</p>
                      <p><Clock size={16} /> {res.time}</p>
                      <p>📧 {res.userEmail}</p>
                    </div>
                    {res.status === 'en attente' && (
                      <div className="reservation-admin-actions">
                        <button 
                          className="btn-approve"
                          onClick={() => handleUpdateReservationStatus(res.id, 'confirmée')}
                        >
                          <CheckCircle size={16} />
                          Confirmer
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleUpdateReservationStatus(res.id, 'annulée')}
                        >
                          <XCircle size={16} />
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data-admin">Aucune réservation pour le moment</p>
            )}
          </div>

          {/* Section Liste des élèves */}
          <div className="users-table-container">
            <h2>👥 Liste des élèves avec activités</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Quiz complétés</th>
                  <th>Vues panneaux</th>
                  <th>Dernier score</th>
                  <th>Versement 1</th>
                  <th>Versement 2</th>
                  <th>Total Payé</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td><strong>#{index + 1}</strong></td>
                    <td>{user.nom}</td>
                    <td>{user.prenom}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.isPremium ? (
                        <span className="badge-premium">Premium</span>
                      ) : (
                        <span className="badge-gratuit">Gratuit</span>
                      )}
                    </td>
                    <td>
                      <span className="activity-count">{user.quizCompletedCount || 0}</span>
                    </td>
                    <td>
                      <span className="activity-count">{user.panneauxViewCount || 0}</span>
                    </td>
                    <td>
                      {user.lastQuizScore !== undefined ? (
                        <span className="score-display">{user.lastQuizScore}/{user.lastQuizTotal}</span>
                      ) : (
                        <span className="no-data">-</span>
                      )}
                    </td>
                    <td>
                      {user.versement1 ? (
                        <span className="badge-paid">✓ Payé</span>
                      ) : (
                        <span className="badge-pending">En attente</span>
                      )}
                    </td>
                    <td>
                      {user.versement2 ? (
                        <span className="badge-paid">✓ Payé</span>
                      ) : (
                        <span className="badge-pending">En attente</span>
                      )}
                    </td>
                    <td><strong>{(user.totalPaid || 0).toLocaleString()} FCFA</strong></td>
                    <td>
                      <button 
                        className="btn-send-message"
                        onClick={() => {
                          setSelectedUserForMessage(user);
                          setShowMessageModal(true);
                        }}
                        title="Envoyer un message"
                      >
                        <Send size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal d'envoi de message */}
        {showMessageModal && (
          <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>📨 Envoyer un message</h2>
              <p>À: <strong>{selectedUserForMessage?.prenom} {selectedUserForMessage?.nom}</strong></p>
              
              <textarea
                placeholder="Votre message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="message-textarea"
                rows="6"
              />
              
              <div className="modal-buttons">
                <button onClick={handleSendMessage} disabled={loading} className="btn-confirm">
                  {loading ? 'Envoi...' : 'Envoyer'}
                </button>
                <button onClick={() => {
                  setShowMessageModal(false);
                  setMessageText('');
                  setSelectedUserForMessage(null);
                }} className="btn-cancel">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PAGE QUIZ
  if (currentPage === 'quiz') {
    const quizData = userData?.isPremium ? QUIZ_PREMIUM : QUIZ_GRATUITS;
    
    if (quizFinished) {
      const percentage = Math.round((score / quizData.length) * 100);
      const passed = percentage >= 75;

      return (
        <div className="app">
          <div className="quiz-result-container">
            <div className="result-card">
              <button onClick={goHome} className="btn-back-page" style={{marginBottom: '20px'}}>
                <ArrowLeft size={20} />
                Retour au dashboard
              </button>

              <Trophy size={70} className={passed ? 'trophy-gold' : 'trophy-silver'} />
              <h1>{passed ? '🎉 Félicitations !' : '💪 Continuez !'}</h1>
              
              <div className="score-large">
                <div className="score-number">{score} / {quizData.length}</div>
                <div className="score-percentage">{percentage}%</div>
              </div>
              
              <p className="result-message">
                {passed ? "Excellent ! Vous maîtrisez bien le code !" : "Révisez et réessayez !"}
              </p>

              <div className="result-buttons">
                <button onClick={() => startQuiz(userData?.isPremium)} className="btn-retry">
                  🔄 Recommencer
                </button>
                <button onClick={goHome} className="btn-dashboard">
                  📊 Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const question = quizData[currentQuiz];
    const isCorrect = selectedAnswer === question.correcte;

    return (
      <div className="app">
        <nav className="quiz-nav">
          <button onClick={goHome} className="btn-back-quiz">
            <ArrowLeft size={18} />
            Quitter
          </button>
          <div className="quiz-progress-text">
            Question {currentQuiz + 1} / {quizData.length}
          </div>
          <div className="quiz-score-display">Score: {score}</div>
        </nav>

        <div className="quiz-content">
          <div className="question-card-large">
            <h2 className="question-text">{question.question}</h2>
            
            <div className="answers-grid-large">
              {question.reponses.map((reponse, index) => {
                let buttonClass = 'answer-btn-large';
                
                if (showResult) {
                  if (index === question.correcte) {
                    buttonClass += ' correct';
                  } else if (index === selectedAnswer) {
                    buttonClass += ' incorrect';
                  }
                }
                
                return (
                  <button
                    key={`answer-${question.id}-${index}`}
                    onClick={() => !showResult && handleAnswer(index)}
                    className={buttonClass}
                    disabled={showResult}
                  >
                    <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="answer-text">{reponse}</span>
                    {showResult && index === question.correcte && <span className="answer-icon">✓</span>}
                    {showResult && index === selectedAnswer && index !== question.correcte && <span className="answer-icon">✗</span>}
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className={`result-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
                <h3>{isCorrect ? '✓ Bonne réponse !' : '✗ Mauvaise réponse'}</h3>
                <p>Réponse correcte : <strong>{question.reponses[question.correcte]}</strong></p>
                <button onClick={nextQuestion} className="btn-next">
                  {currentQuiz < quizData.length - 1 ? 'Suivant →' : 'Voir résultats'}
                </button>
              </div>
            )}
          </div>

          <div className="progress-bar-quiz">
            <div 
              className="progress-fill-quiz" 
              style={{width: `${((currentQuiz + 1) / quizData.length) * 100}%`}}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;