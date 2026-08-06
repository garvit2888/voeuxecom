export const CATEGORIES = [
  { id: 'android-players', name: 'Android Players', icon: 'Tv', count: 12, description: '4K QLED Touchscreen stereos with Wireless CarPlay & 32-Band DSP', image: '/images/android_player_1.png' },
  { id: 'speakers-soundbars', name: 'Speakers & Soundbars', icon: 'Speaker', count: 8, description: 'High-fidelity car soundbars, coaxial speakers & subwoofers', image: '/images/soundbar_1.png' },
];

export const PRODUCTS = [
  {
    id: 'voeux-x80-dual-knob',
    name: 'Voeux X80 Diamond Premium Android Car Stereo (4GB+64GB)',
    category: 'android-players',
    price: 8499,
    originalPrice: 39999,
    flipkartUrl: 'https://www.flipkart.com/voeux-premium-x80-series-dual-knob-10-1-android-stereo-ahd-camera-4gb-64gb-car/p/itmac82d9bb03bba?pid=CDPHJTY3R9RNTTGT&lid=LSTCDPHJTY3R9RNTTGTBOXXMT&marketplace=FLIPKART&q=voeux+x80+car+android+&store=1mt%2Feoe%2Fwmk&srno=s_1_3&otracker=search&otracker1=search&fm=Search&iid=2aaf1827-5f94-4422-ba51-05a289f2cd6f.CDPHJTY3R9RNTTGT.SEARCH&ppt=sp&ppn=sp&ssid=mbc2lmau3k0000001785990213559&qH=e7e33053e446ca94&ov_redirect=true&ov_redirect=true',
    rating: 4.9,
    reviewsCount: 158,
    badge: 'X80 Diamond Flagship',
    isNew: true,
    isTrending: true,
    isBestseller: true,
    image: '/images/voeux_x80_stereo.jpg',
    gallery: [
      '/images/voeux_x80_stereo.jpg',
      '/images/voeux_x80_piano_buttons_stereo.png'
    ],
    shortSpecs: [
      '10.1" IPS Touchscreen Display',
      '4GB RAM + 64GB Storage',
      'Dual Knob Premium Design',
      'AHD Rear View Camera Included',
      'Built-in Bluetooth, Wi-Fi & GPS',
      'Supports USB, AUX & Steering Controls'
    ],
    fullSpecs: {
      'Display Size': '10.1 Inch IPS High-Definition Touchscreen',
      'RAM & Storage': '4GB RAM + 64GB Storage',
      'Design': 'Dual Knob Premium Design',
      'Preset Tuner': '3Bands * 6Stations',
      'FM Frequency Range': '87.5-108.0 MHz',
      'AM Frequency Range': '530-1710 kHz',
      'Number of FM Channels': '18',
      'Number of AM Channels': '12',
      'Steering Wheel Controls': 'Yes',
      'Mounting Frame': 'No',
      'In The Box': '1 Voeux Android Car Media Player Unit, 1 Power Cable Harness, 1 GPS Antenna, 1 AHD Camera',
      'Connectivity': 'Built-in Bluetooth, Wi-Fi & GPS, USB, AUX',
      'Fitment': 'Double DIN Universal Fit',
      'Warranty Summary': '1 Year Domestic Warranty on Manufacturing Defects',
      'Covered in Warranty': 'Warranty covers manufacturing defects in the hardware components of the product.',
      'Not Covered in Warranty': 'Warranty does not cover physical damage, water damage, burnt units, unauthorized modifications, accessories, or issues arising from improper installation.',
      'Warranty Service Type': 'Customer needs to call or email the customer support. The product will be repaired or replaced at the nearest service center or picked up for service.'
    },
    compatibility: ['Hyundai Creta', 'Maruti Swift', 'Tata Nexon', 'Kia Seltos', 'Mahindra Thar', 'Honda City', 'Universal Double DIN Fit'],
    description: 'Voeux X80 Diamond Premium Android Car Stereo (4GB+64GB). Upgrade your driving experience with the Voeux X80 Diamond, a premium 10.1-inch Android car multimedia system designed for performance, clarity, and seamless connectivity. Powered by a fast and stable Android platform with 4GB RAM and 64GB internal storage, this system ensures smooth multitasking, lag-free navigation, and ample space for apps, music, and videos. Featuring a high-resolution IPS touchscreen display, the X80 Diamond delivers vibrant visuals, sharp contrast, and excellent visibility in all lighting conditions. The stylish dual-knob design adds a premium feel while providing precise control for volume and media settings. Equipped with an AHD rear camera, this system offers crystal-clear reverse visuals for safer parking and maneuvering. Enjoy built-in Bluetooth for hands-free calling and music streaming, Wi-Fi support for online apps, GPS navigation for real-time directions, and USB connectivity for external media. Designed as a Double DIN unit, the X80 Diamond is compatible with most cars and offers a sleek, modern dashboard upgrade. Whether you are commuting or on a long drive, this advanced Android car stereo brings entertainment, safety, and convenience together in one powerful package.',
    features: [
      '10.1-inch IPS Touchscreen Display',
      'Android System with 4GB RAM + 64GB Storage',
      'Dual Knob Premium Design',
      'AHD Rear View Camera Included',
      'Built-in Bluetooth, Wi-Fi & GPS',
      'Supports USB, AUX, and Steering Controls',
      'Double DIN Universal Fit'
    ],
    reviews: [
      { id: 1, author: 'Vikram S.', rating: 5, date: '2 days ago', comment: 'The dual rotary knobs are a game changer! Makes adjusting volume while driving so safe and convenient.', verified: true },
      { id: 2, author: 'Ankit Sharma', rating: 5, date: '1 week ago', comment: 'Wireless CarPlay connects instantly. Screen touch speed is fast and sound quality is crisp.', verified: true }
    ],
    launchDate: '2026-08-01',
    stock: 30
  },
  {
    id: 'voeux-160w-separable-soundbar',
    name: 'VOEUX® 160W 2-in-1 Separable Bluetooth Soundbar with Subwoofer',
    category: 'speakers-soundbars',
    price: 9999,
    originalPrice: 14999,
    rating: 4.9,
    reviewsCount: 114,
    badge: '2-in-1 Convertible',
    isNew: true,
    isTrending: true,
    isBestseller: true,
    image: '/images/voeux_separable_soundbar.png',
    gallery: [
      '/images/voeux_separable_soundbar.png',
      '/images/voeux_separable_soundbar.png'
    ],
    shortSpecs: ['160W Peak Power', '2-in-1 Separable Design', '2.1 CH Subwoofer', 'Bluetooth 5.0 & HDMI ARC'],
    fullSpecs: {
      'Power Output': '160 Watts RMS Sound Pressure',
      'Design': '2-in-1 Convertible Dual Tower & Horizontal Bar',
      'Audio System': '2.1 Channel with External Bass Subwoofer',
      'Connectivity': 'Bluetooth 5.0, HDMI ARC, Optical, Aux 3.5mm, Coaxial, USB',
      'Sound Modes': '3D Surround Sound, 10 Sound Effects Presets',
      'Warranty': '1 Year VOEUX Doorstep Warranty'
    },
    compatibility: ['Smart TVs, Home Theater & Car 12V/220V Audio Systems'],
    description: 'The ultimate versatile 160W soundbar. Features a 2-in-1 separable design that transforms from a single sleek horizontal soundbar into twin vertical tower speakers with a powerful dedicated subwoofer.',
    features: [
      '2-in-1 convertible design: Use as horizontal soundbar or dual tower speakers',
      'Dedicated external subwoofer for punchy deep bass',
      'Bluetooth 5.0, HDMI ARC, Optical, and AUX input support',
      '3D Surround sound engine with 10 equalizer sound effect presets'
    ],
    reviews: [
      { id: 1, author: 'Rohan Mehra', rating: 5, date: '3 days ago', comment: 'Amazing 2-in-1 separable feature! Sound output is crystal clear and bass is super punchy.', verified: true }
    ],
    launchDate: '2026-07-28',
    stock: 25
  },
  {
    id: 'voeux-150w-amp-board',
    name: 'VOEUX® AMP Board 150W Mono Class AB Car Amplifier',
    category: 'speakers-soundbars',
    price: 2499,
    originalPrice: 3999,
    rating: 4.9,
    reviewsCount: 168,
    badge: 'Class AB Performance',
    isNew: true,
    isTrending: true,
    isBestseller: true,
    image: '/images/voeux_amp_board.png',
    gallery: [
      '/images/voeux_amp_board.png',
      '/images/voeux_amp_board.png'
    ],
    shortSpecs: ['150W RMS Mono Output', 'Class AB Analog Circuit', 'Bass Crossover Control', '12V 25A Fuse Protected'],
    fullSpecs: {
      'Power Output': '150 Watts RMS Max Sound Pressure',
      'Circuit Architecture': 'High-Efficiency Mono Class AB Analog Amplifier Board',
      'Frequency Control': 'Variable Crossover (40Hz - 200Hz) & Volume Gain Knobs',
      'Input Modes': 'RCA Audio In/Out, High Level Input, 3.5mm MP3 Aux',
      'Protection': '25A Heavy Duty Blade Fuse, Heat-sink Thermal Protection',
      'Warranty': '1 Year VOEUX Doorstep Replacement Warranty'
    },
    compatibility: ['Car Basstubes, Subwoofers & High-Output Door Speakers (12V System)'],
    description: 'High-performance 150W Mono Class AB car amplifier board. Designed for driving basstubes and subwoofers with deep punchy bass, featuring built-in crossover controls, gain adjustment, and 25A fuse safety.',
    features: [
      'High-efficiency Class AB mono circuit for clean, low-distortion bass response',
      'Variable crossover frequency control (40Hz - 200Hz)',
      'Multiple inputs: RCA, High-level speaker input, and 3.5mm Aux',
      'Built-in 25A fuse and aluminum heatsink chassis for cool operation'
    ],
    reviews: [
      { id: 1, author: 'Manish K.', rating: 5, date: '1 day ago', comment: 'Pushes my 12-inch basstube with unbelievable bass pressure! Zero heating issues.', verified: true }
    ],
    launchDate: '2026-08-02',
    stock: 40
  },
  {
    id: 'voeux-hyperdrive-lite-9',
    name: 'Voeux Android 10.1" Dual Knob Piano Buttons (4GB/64GB) Android Car Multimedia Player Car Stereo (Double Din) with Apple CarPlay & Android Auto',
    category: 'android-players',
    price: 8499,
    originalPrice: 39999,
    flipkartUrl: 'https://www.flipkart.com/voeux-premium-x80-series-dual-knob-10-1-android-stereo-ahd-camera-4gb-64gb-car/p/itmac82d9bb03bba',
    rating: 4.9,
    reviewsCount: 158,
    badge: 'Piano Buttons Flagship',
    isNew: true,
    isTrending: true,
    isBestseller: true,
    image: '/images/voeux_x80_piano_buttons_stereo.png',
    gallery: ['/images/voeux_x80_piano_buttons_stereo.png'],
    shortSpecs: [
      '10.1 Inch QLED Touchscreen Display',
      'Dual Knob & Piano Buttons Design',
      '4GB RAM + 64GB Storage',
      'AHD Rear View Camera Included',
      'Apple CarPlay & Android Auto',
      'Double DIN Universal Fit'
    ],
    fullSpecs: {
      'Brand & Model': 'Voeux - Android 10.1" Dual Knob Piano Buttons (4GB/64GB)',
      'Type & Fitment': 'Audio & Video, Double DIN Universal For Car',
      'Display Features': '10.1 Inch QLED Touchscreen Display (Full Colour, ID3 Tag Display, Display Off)',
      'Storage Features': '4GB RAM + 64GB Built-in Memory',
      'Preset Tuner': '3Bands * 6Stations',
      'FM Frequency Range': '87.5-108.0 MHz (18 FM Channels)',
      'AM Frequency Range': '530-1710 kHz (12 AM Channels)',
      'Steering Wheel Controls': 'Yes',
      'Mounting Frame': 'No',
      'In the Box': '1 Voeux Android Car Media Player Unit, 1 Power Cable Harness, 1 GPS Antenna, 1 AHD Camera',
      'Audio & Power': 'MOSFET 50W x 4 (240W Max Output Power, 12V DC Requirement)',
      'Built-in Equaliser': 'Normal, Pop, Jazz, Classical, Flat, User (Balance Control, Bass Boost, Treble, Loudness)',
      'RCA Outputs': '4V RCA (Front, Rear, Subwoofer), 4V Sub-woofer Pre-amp (Digital Optical Out: No)',
      'Supported Formats': 'Audio: AAC, MP3, iTunes, WAV, WMA | Video: MP4, AVI, MKV, MOV, WMV, FLV | Picture: JPEG, JPG, GIF, PNG, BMP',
      'GUI & Convenience': '3D Graphical User Interface, Android Auto, Apple CarPlay, GPS Navigation, MirrorLink, iOS Connectivity, HD Radio, Touchscreen, Siri Eyes Free Control',
      'Connectivity': 'Bluetooth 5.0, AUX, Wi-Fi, USB',
      'Dimensions': 'Width: 32 cm | Height: 40 cm | Depth: 7 cm | Weight: 2 kg',
      'Warranty Summary': '1 Year Domestic Warranty on Manufacturing Defects',
      'Covered in Warranty': 'Warranty covers manufacturing defects in the hardware components of the product.',
      'Not Covered in Warranty': 'Warranty does not cover physical damage, water damage, burnt units, unauthorized modifications, accessories, or issues arising from improper installation.',
      'Warranty Service Type': 'Customer needs to call or email the customer support. The product will be repaired or replaced at the nearest service center or picked up for service.'
    },
    compatibility: ['Universal Double DIN Fit For All Car Models'],
    description: 'Voeux Android 10.1" Dual Knob Piano Buttons (4GB/64GB) Android Car Multimedia Player Car Stereo (Double Din) with Apple CarPlay & Android Auto. Features 10.1 Inch QLED Touchscreen Display, Dual Knob & Piano Buttons design, included AHD camera, Bluetooth 5.0, Wi-Fi, GPS navigation, and 240W max output power.',
    features: [
      '10.1 Inch QLED Touchscreen Display',
      'Dual knob & Piano Buttons design',
      'AHD Camera included',
      'Android Auto & Apple CarPlay support',
      '4GB RAM + 64GB Built-in Memory',
      'Bluetooth 5.0, AUX, Wi-Fi & USB Connectivity',
      'Double DIN Universal Fitment'
    ],
    reviews: [],
    launchDate: '2026-08-05',
    stock: 25
  },
  {
    id: 'voeux-pulsar-speakers-coaxial',
    name: 'VOEUX® Pulsar 6.5" 400W 3-Way Coaxial Car Speakers (Pair)',
    category: 'speakers-soundbars',
    price: 3499,
    originalPrice: 4999,
    rating: 4.8,
    reviewsCount: 77,
    badge: 'Popular',
    isNew: false,
    isTrending: true,
    isBestseller: false,
    image: '/images/soundbar_1.png',
    gallery: ['/images/soundbar_1.png'],
    shortSpecs: ['400W Max Peak', '3-Way Audio System', 'Polypropylene Cone', 'Silk Dome Tweeter'],
    fullSpecs: {
      'Power Output': '400W Peak / 70W RMS per pair',
      'Frequency Range': '45Hz - 20,000Hz',
      'Impedance': '4 Ohms',
      'Tweeter': '1-Inch Silk Dome Tweeter',
      'Warranty': '1 Year Warranty'
    },
    compatibility: ['Fits standard 6.5-inch door speaker slots in 95% cars'],
    description: 'Crisp highs and warm mid-bass. Crisp upgrade over dull factory paper speakers.',
    features: ['Rubber surround edge for prolonged durability', 'Includes decorative protective grills'],
    reviews: [],
    launchDate: '2026-04-12',
    stock: 22
  }
];

export const UPCOMING_PRODUCTS = [
  {
    id: 'voeux-hyperdrive-ultra-4k',
    name: 'VOEUX® HyperDrive Ultra 12.3" Dual-Screen Android Player',
    category: 'Android Players',
    expectedRelease: 'Release in 5 Days',
    countdownTarget: '2026-08-10T00:00:00',
    priceEstimate: '₹29,999',
    teaserImage: '/images/hero_banner.png',
    tag: 'Next-Gen Drop',
    specs: ['12.3" Dual Screen', '8GB RAM + 256GB Storage', 'HDMI Out', '5G eSIM Built-in']
  }
];

export const BLOG_POSTS = [
  {
    id: 1,
    title: 'Top 5 Reasons to Upgrade Your Factory Stereo to a 4K QLED Android Player',
    category: 'Infotainment Tech',
    date: 'Aug 02, 2026',
    author: 'VOEUX Tech Team',
    summary: 'Discover how 32-band DSP audio tuning, wireless CarPlay, and 4K screen clarity elevate your daily driving experience.',
    image: '/images/android_player_1.png'
  }
];

export const DEALERS = [
  {
    id: 1,
    name: 'VOEUX Studio & Fitment Center - Connaught Place',
    city: 'New Delhi',
    pin: '110001',
    address: 'Block C, Inner Circle, Connaught Place, New Delhi',
    phone: '+91 98765 43210',
    rating: 4.9,
    timings: '10:00 AM - 8:00 PM (Open 7 Days)'
  },
  {
    id: 2,
    name: 'VOEUX Certified Installer - BKC Tech Park',
    city: 'Mumbai',
    pin: '400051',
    address: 'Plot 14, G-Block, Bandra Kurla Complex, Mumbai',
    phone: '+91 98765 43211',
    rating: 4.8,
    timings: '10:30 AM - 7:30 PM (Sun Closed)'
  },
  {
    id: 3,
    name: 'VOEUX Audio Hub - Indiranagar',
    city: 'Bengaluru',
    pin: '560038',
    address: '100 Feet Road, 12th Main, Indiranagar, Bengaluru',
    phone: '+91 98765 43212',
    rating: 4.9,
    timings: '10:00 AM - 8:00 PM (Open 7 Days)'
  }
];

export const CAR_MODELS = [
  { make: 'Hyundai', models: ['Creta', 'Venue', 'i20', 'Verna', 'Tucson', 'Exster', 'Alcatraz'] },
  { make: 'Maruti Suzuki', models: ['Swift', 'Baleno', 'Brezza', 'Fronx', 'Grand Vitara', 'Ertiga', 'Jimny'] },
  { make: 'Tata Motors', models: ['Nexon', 'Punch', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Curvv'] },
  { make: 'Kia', models: ['Seltos', 'Sonet', 'Carens', 'EV6'] },
  { make: 'Mahindra', models: ['Thar', 'XUV700', 'Scorpio-N', 'XUV300', 'Scorpio Classic'] },
  { make: 'Honda', models: ['City', 'Elevate', 'Amaze', 'Civic'] },
  { make: 'Toyota', models: ['Fortuner', 'Innova Hycross', 'Urban Cruiser Taisor', 'Glanza', 'Hilux'] }
];
