export type Region =
  | "Coastal San Diego"
  | "Central San Diego"
  | "North County Coastal"
  | "North County Inland"
  | "South Bay & East County";

export const regions: Region[] = [
  "Coastal San Diego",
  "North County Coastal",
  "Central San Diego",
  "North County Inland",
  "South Bay & East County",
];

export type Area = {
  slug: string;
  name: string;
  region: Region;
  /** Only featured areas have photography; the rest render as text cards. */
  image?: string;
  featured?: boolean;
  tagline: string;
  blurb: string;
  description: string[];
  bestFor: string[];
  highlights: string[];
  homes: string;
  schools: string;
  pockets: string[];
  nearby: string[];
  coords: [number, number];
};

export const areas: Area[] = [
  {
    slug: "la-jolla",
    name: "La Jolla",
    region: "Coastal San Diego",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1600&auto=format&fit=crop",
    tagline: "The jewel of the coast",
    blurb: "Coastal bluffs, top-rated schools, and some of the county's finest homes.",
    description: [
      "Perched above some of the bluest water in Southern California, La Jolla pairs postcard views with a genuinely walkable village — boutique galleries, oceanfront dining, and sea lions napping on the rocks below.",
      "Homes range from mid-century view cottages near the Village to estate-scale architecture on Mount Soledad and in La Jolla Farms. Inventory is tight and well-priced homes move quickly, so buyers here benefit from an agent who hears about properties early — and sellers benefit from pricing that reflects the micro-market of their specific street.",
    ],
    bestFor: ["Luxury & view-seekers", "Retirees & downsizers", "Established professionals"],
    highlights: [
      "La Jolla Cove is one of the best spots in the country to snorkel alongside leopard sharks and sea lions.",
      "Home to UC San Diego and the Salk Institute, two of the world's leading research institutions.",
      "The Village's restaurant and gallery scene rivals much bigger cities, without the traffic.",
      "Torrey Pines State Reserve and its cliffside trails are just minutes away.",
    ],
    homes:
      "Ocean-view single-family homes, Village condos, mid-century ranches, and gated estates. Expect a premium for views, walkability to the Village, and proximity to La Jolla Shores.",
    schools: "Served by San Diego Unified, including La Jolla High School, plus several well-known private schools.",
    pockets: ["The Village", "La Jolla Shores", "Bird Rock", "Muirlands", "La Jolla Farms", "Mount Soledad"],
    nearby: ["pacific-beach", "del-mar", "carmel-valley"],
    coords: [32.8328, -117.2713],
  },
  {
    slug: "del-mar",
    name: "Del Mar",
    region: "North County Coastal",
    featured: true,
    image: "/images/area-del-mar.jpg",
    tagline: "Where the surf meets the turf",
    blurb: "Bluff-top living and one of the county's smallest, most exclusive zip codes.",
    description: [
      "Del Mar is tiny by design — one of San Diego County's smallest cities, and one of its most expensive. Bluff-top homes look straight down the coast, and the village center still feels more like a beach cottage strip than a downtown.",
      "Because so few homes change hands each year, every sale here is a small event. Sellers need marketing that reaches qualified luxury buyers well beyond San Diego; buyers need patience, preparation, and someone watching for the right home before it's widely advertised.",
    ],
    bestFor: ["Ultra-luxury buyers", "Empty nesters", "Buyers who want privacy over density"],
    highlights: [
      "Home to the Del Mar Racetrack — \"where the surf meets the turf\" — and the San Diego County Fair.",
      "One of the smallest incorporated cities in the county by both size and population.",
      "Torrey Pines State Beach and its dramatic sandstone bluffs sit right at its border.",
      "Consistently among the highest median home prices in San Diego County.",
    ],
    homes:
      "Oceanfront and ocean-view single-family homes, beach cottages, and a limited number of condos. Lot size, view corridors, and coastal permitting all play a big role in value.",
    schools: "Del Mar Union School District for elementary grades and San Dieguito Union High School District, including Torrey Pines High.",
    pockets: ["Beach Colony", "Olde Del Mar", "Del Mar Heights (adjacent)"],
    nearby: ["solana-beach", "carmel-valley", "la-jolla"],
    coords: [32.9595, -117.2653],
  },
  {
    slug: "coronado",
    name: "Coronado",
    region: "Coastal San Diego",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600&auto=format&fit=crop",
    tagline: "Small-town charm, big views",
    blurb: "Island charm, walkable streets, and views across San Diego Bay.",
    description: [
      "Technically a peninsula, Coronado feels like an island — and acts like a small town, with Orange Avenue's Main Street energy just blocks from some of the widest, whitest sand in the county.",
      "It's one of the few places in San Diego where you can walk your kids to school, the beach, and dinner without moving your car. That lifestyle keeps demand steady year-round, especially from military families stationed at North Island and buyers relocating from out of state.",
    ],
    bestFor: ["Military & Navy families", "Multi-generational families", "Buyers who want to walk everywhere"],
    highlights: [
      "Home to the historic Hotel del Coronado, one of the last surviving wooden Victorian beach resorts in the country.",
      "Naval Air Station North Island anchors a strong, tight-knit military community.",
      "Coronado Central Beach is consistently ranked among the best beaches in the U.S.",
      "Connected to San Diego by a dramatic 2.1-mile bridge with sweeping bay views.",
    ],
    homes:
      "Historic cottages and Craftsman homes in the Village, beachfront estates along Ocean Boulevard, high-rise condos at Coronado Shores, and waterfront homes with private docks in the Cays.",
    schools: "Coronado Unified School District serves the whole city.",
    pockets: ["The Village", "Coronado Shores", "Coronado Cays"],
    nearby: ["point-loma", "downtown-san-diego", "chula-vista"],
    coords: [32.6859, -117.1831],
  },
  {
    slug: "carlsbad",
    name: "Carlsbad",
    region: "North County Coastal",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop",
    tagline: "The Village by the Sea",
    blurb: "Family-friendly beach town with newer construction and great schools.",
    description: [
      "Carlsbad manages to be both laid-back beach town and genuinely family-oriented suburb — well-regarded schools, master-planned communities, and a downtown Village that still feels like a small coastal town rather than a shopping center.",
      "The city has a wide range of price points, from Village condos to golf-course homes in Aviara and La Costa. That variety makes it a great fit for move-up buyers who want coastal living with more space than the southern beach towns offer.",
    ],
    bestFor: ["Growing families", "Golf & outdoor lovers", "Buyers who want newer construction"],
    highlights: [
      "Home to LEGOLAND California and the seasonal Flower Fields, both major family draws.",
      "A hub for the biotech, life sciences, and golf industries, with major employers based locally.",
      "Three lagoons give much of the city direct water or wetland views.",
      "The Coaster commuter train connects Carlsbad Village to Downtown San Diego.",
    ],
    homes:
      "Master-planned single-family neighborhoods, Village cottages and townhomes, golf-course homes, and newer construction with solar and larger floor plans.",
    schools: "Mostly Carlsbad Unified School District; parts of La Costa are served by Encinitas Union, San Dieguito Union, or San Marcos Unified.",
    pockets: ["Carlsbad Village", "La Costa", "Aviara", "Bressi Ranch", "Calavera Hills"],
    nearby: ["oceanside", "encinitas", "san-marcos"],
    coords: [33.1581, -117.3506],
  },
  {
    slug: "encinitas",
    name: "Encinitas",
    region: "North County Coastal",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1600&auto=format&fit=crop",
    tagline: "Surf culture, small-town soul",
    blurb: "Laid-back surf culture with a tight-knit, walkable community.",
    description: [
      "Encinitas is the loosest, most laid-back stretch of North County coast — a patchwork of surf breaks, farm stands, and walkable neighborhoods like Leucadia and Cardiff-by-the-Sea.",
      "Homes trade a bit of square footage for lifestyle: bike to the beach, know your neighbors, and rarely need a reason to leave. Further inland, Olivenhain offers larger lots and equestrian properties while keeping the same school districts.",
    ],
    bestFor: ["Surfers & beach lifestyle buyers", "Creatives & entrepreneurs", "Buyers who value walkability over size"],
    highlights: [
      "Swami's is one of the most famous surf breaks in Southern California.",
      "Home to the Self-Realization Fellowship's meditation gardens overlooking the ocean.",
      "A longtime hub for the flower-growing industry — working nurseries still dot the area.",
      "Historic Coast Highway 101 runs through a string of distinct, walkable town centers.",
    ],
    homes:
      "Beach cottages, 1970s–80s ranch homes ripe for remodeling, newer infill builds, and acreage in Olivenhain. ADU potential is a frequent conversation here.",
    schools: "Encinitas Union and Cardiff school districts for elementary grades; San Dieguito Union High School District for middle and high school.",
    pockets: ["Leucadia", "Old Encinitas", "Cardiff-by-the-Sea", "Olivenhain", "New Encinitas"],
    nearby: ["solana-beach", "carlsbad", "rancho-santa-fe"],
    coords: [33.037, -117.292],
  },
  {
    slug: "point-loma",
    name: "Point Loma",
    region: "Coastal San Diego",
    featured: true,
    image: "/images/area-point-loma.jpg",
    tagline: "History, harbor views, and quiet streets",
    blurb: "Historic peninsula living with water views on nearly every side.",
    description: [
      "Point Loma sits on its own peninsula between the Pacific and San Diego Bay, so many homes get water views from both sides. It's older and more established than the North County beach towns — working marinas, a historic lighthouse, and streets that have stayed quietly residential.",
      "Point Loma is only minutes from the airport and downtown, which makes it one of the most convenient coastal neighborhoods in the city. Buyers should know which pockets sit under the flight path — it's one of the first things I walk clients through.",
    ],
    bestFor: ["Water views without beach-town prices", "History lovers", "Boating & sailing families"],
    highlights: [
      "Cabrillo National Monument marks where European explorers first landed on the West Coast in 1542.",
      "Home to a still-active fishing fleet and several full-service marinas along Shelter Island.",
      "Sunset Cliffs Natural Park offers some of the most dramatic coastal views in the city.",
      "Point Loma Nazarene University sits on a bluff-top campus overlooking the ocean.",
    ],
    homes:
      "Mid-century homes with bay views, Spanish-style houses in the Wooded Area, bayfront estates in La Playa, and cottages near Sunset Cliffs.",
    schools: "San Diego Unified, including Point Loma High School, plus several private and parochial schools.",
    pockets: ["La Playa", "Wooded Area", "Sunset Cliffs", "Roseville", "Loma Portal", "Fleetridge"],
    nearby: ["ocean-beach", "mission-hills", "coronado"],
    coords: [32.7266, -117.2381],
  },
  {
    slug: "pacific-beach",
    name: "Pacific Beach",
    region: "Coastal San Diego",
    tagline: "Boardwalk energy, bay-side calm",
    blurb: "A lively beach neighborhood with the ocean on one side and Mission Bay on the other.",
    description: [
      "Pacific Beach — \"PB\" to locals — is San Diego's classic beach town: a three-mile boardwalk, Crystal Pier's cottages over the waves, and Garnet Avenue's restaurants and nightlife.",
      "Move a few blocks away from the busiest streets, though, and PB turns quiet and residential. Crown Point and the streets around Sail Bay offer calm water, bike paths, and some of the best sunset views on Mission Bay — often at lower prices than La Jolla just to the north.",
    ],
    bestFor: ["Young professionals", "Active, outdoorsy buyers", "Investors & second-home buyers"],
    highlights: [
      "Crystal Pier, with its historic cottages built right over the ocean.",
      "Ocean Front Walk connects Pacific Beach to Mission Beach along the sand.",
      "Kate Sessions Park offers sweeping views over the bay, downtown, and Point Loma.",
      "Mission Bay's calm water is ideal for paddleboarding, sailing, and kayaking.",
    ],
    homes:
      "Beach condos, townhomes, original cottages on small lots, and larger single-family homes on the hillside streets of North PB with ocean views.",
    schools: "San Diego Unified, including Mission Bay High School.",
    pockets: ["Crown Point", "North Pacific Beach", "Sail Bay"],
    nearby: ["mission-beach", "la-jolla", "ocean-beach"],
    coords: [32.7978, -117.24],
  },
  {
    slug: "mission-beach",
    name: "Mission Beach",
    region: "Coastal San Diego",
    tagline: "Ocean on one side, bay on the other",
    blurb: "A narrow strip of beach living between the Pacific and Mission Bay.",
    description: [
      "Mission Beach is barely a few blocks wide — the Pacific on one side, Mission Bay on the other, and a web of walk streets in between. It's the most purely \"beach\" neighborhood in the city.",
      "Many homes here double as vacation rentals, and San Diego's short-term rental rules treat Mission Beach differently from the rest of the city. If rental income is part of your plan, it's essential to understand licensing before you write an offer.",
    ],
    bestFor: ["Second-home buyers", "Rental investors", "Buyers who want to live on the sand"],
    highlights: [
      "Belmont Park's Giant Dipper is a historic wooden roller coaster dating to 1925.",
      "Walk streets (\"courts\" and \"places\") lead straight to the sand with no car traffic.",
      "Bayside beaches offer calm water for families and paddleboarders.",
      "The boardwalk links Mission Beach and Pacific Beach for miles of car-free coastline.",
    ],
    homes:
      "Beach cottages, duplexes, and modern rebuilds on small lots, plus bayfront homes with private patios on the sand.",
    schools: "San Diego Unified, including Mission Bay High School.",
    pockets: ["South Mission", "North Mission", "Bayside"],
    nearby: ["pacific-beach", "ocean-beach", "point-loma"],
    coords: [32.77, -117.2517],
  },
  {
    slug: "ocean-beach",
    name: "Ocean Beach",
    region: "Coastal San Diego",
    tagline: "Proudly independent, endlessly local",
    blurb: "A funky, tight-knit beach community with a famous pier and dog beach.",
    description: [
      "Ocean Beach — OB — has worked hard to keep its independent spirit. Newport Avenue is lined with antique shops, taco spots, and locally owned cafés, and the Wednesday farmers market doubles as a weekly block party.",
      "Homes are generally smaller and older than in neighboring Point Loma, and that's part of the appeal: a genuine beach-town lifestyle close to downtown and the airport. Well-kept cottages near the water rarely last long.",
    ],
    bestFor: ["Beach lifestyle buyers", "Dog owners", "Buyers who love local character"],
    highlights: [
      "The Ocean Beach Pier is one of the longest piers on the West Coast.",
      "Dog Beach was one of the first leash-free beaches in the country.",
      "Sunset Cliffs sits right at the southern edge of the neighborhood.",
      "Newport Avenue is known for antiques, local restaurants, and very few chains.",
    ],
    homes:
      "Beach cottages and bungalows on small lots, duplexes and small apartment buildings, and view homes climbing into Point Loma Heights.",
    schools: "San Diego Unified, within the Point Loma High School cluster.",
    pockets: ["Sunset Cliffs", "Point Loma Heights", "Newport Avenue"],
    nearby: ["point-loma", "mission-beach", "pacific-beach"],
    coords: [32.7486, -117.2497],
  },
  {
    slug: "downtown-san-diego",
    name: "Downtown San Diego",
    region: "Central San Diego",
    tagline: "High-rise living on the bay",
    blurb: "Waterfront condos, Little Italy dining, and a truly walkable city lifestyle.",
    description: [
      "Downtown San Diego is a collection of distinct neighborhoods — Little Italy's restaurants and Saturday market, the Gaslamp's nightlife, East Village around Petco Park, and the calmer Marina District along the bay.",
      "Most homes here are condos, which means the building matters as much as the unit. HOA dues, reserves, amenities, and rental rules vary widely, and I help buyers compare them line by line before committing.",
    ],
    bestFor: ["Lock-and-leave owners", "Urban professionals", "Downsizers who want walkability"],
    highlights: [
      "Little Italy's Mercato is one of the largest farmers markets in San Diego.",
      "Petco Park, the Convention Center, and Waterfront Park are all walkable.",
      "The airport is only minutes away — a huge plus for frequent travelers.",
      "Trolley and Coaster connections make car-light living realistic.",
    ],
    homes:
      "High-rise and mid-rise condos, lofts, and townhomes, from studios to full-floor penthouses with bay views.",
    schools: "San Diego Unified, with several charter and magnet options nearby.",
    pockets: ["Little Italy", "Marina District", "East Village", "Gaslamp Quarter", "Cortez Hill", "Columbia"],
    nearby: ["mission-hills", "north-park", "coronado"],
    coords: [32.7157, -117.1611],
  },
  {
    slug: "mission-hills",
    name: "Mission Hills",
    region: "Central San Diego",
    tagline: "Historic homes above the city",
    blurb: "Tree-lined streets, historic architecture, and canyon and bay views close to downtown.",
    description: [
      "Mission Hills is one of San Diego's oldest and most beautiful neighborhoods — Craftsman bungalows, Spanish Revival homes, and grand early-1900s houses along quiet, tree-lined streets.",
      "Many homes sit within designated historic districts, which can affect renovation plans and, in some cases, property taxes through the Mills Act. It's a neighborhood where knowing the details of each individual home really pays off.",
    ],
    bestFor: ["Architecture lovers", "Professionals who work downtown", "Buyers who want character homes"],
    highlights: [
      "Presidio Park and the Junípero Serra Museum sit at the neighborhood's edge.",
      "Walkable to the shops and restaurants along Washington Street and India Street.",
      "Canyon-edge homes offer views of the bay, downtown, and Point Loma.",
      "Minutes from Balboa Park, Old Town, and the airport.",
    ],
    homes:
      "Craftsman and Spanish Revival homes, early-century estates, and a smaller number of condos. Historic designations and Mills Act contracts are common.",
    schools: "San Diego Unified, with several highly regarded private schools nearby.",
    pockets: ["Fort Stockton Drive", "Washington Street", "Presidio Park area"],
    nearby: ["downtown-san-diego", "north-park", "point-loma"],
    coords: [32.753, -117.188],
  },
  {
    slug: "north-park",
    name: "North Park",
    region: "Central San Diego",
    tagline: "Craftsman bungalows and craft beer",
    blurb: "San Diego's creative hub, with walkable streets next to Balboa Park.",
    description: [
      "North Park is where San Diego goes to eat, drink, and hang out — a dense mix of independent restaurants, breweries, coffee shops, and galleries centered on University Avenue and 30th Street.",
      "Beyond the busy corridors, streets of restored Craftsman bungalows make it one of the most charming urban neighborhoods in the city. It's also a popular choice for first-time buyers entering the market through condos and townhomes.",
    ],
    bestFor: ["First-time buyers", "Young professionals", "Buyers who want to walk to dinner"],
    highlights: [
      "Borders Balboa Park, home to the San Diego Zoo and 17 museums.",
      "One of the best-known craft beer neighborhoods in a city famous for craft beer.",
      "The Observatory North Park hosts concerts in a restored 1929 theater.",
      "The weekly North Park farmers market draws locals from across the city.",
    ],
    homes:
      "Craftsman and Spanish bungalows, small-lot single-family homes, condos, and townhomes. Many lots have ADU potential.",
    schools: "San Diego Unified.",
    pockets: ["Burlingame", "South Park", "University Heights (adjacent)"],
    nearby: ["mission-hills", "downtown-san-diego", "la-mesa"],
    coords: [32.7417, -117.1297],
  },
  {
    slug: "solana-beach",
    name: "Solana Beach",
    region: "North County Coastal",
    tagline: "Small city, big personality",
    blurb: "A tiny coastal city with a design district, live music, and easy train access.",
    description: [
      "Solana Beach packs a lot into a small footprint: the Cedros Design District's boutiques and galleries, the legendary Belly Up music venue, and Fletcher Cove's beach park.",
      "Its Coaster and Amtrak station makes it one of the easiest coastal towns to commute from, and it shares highly regarded school districts with neighboring Del Mar and Carmel Valley.",
    ],
    bestFor: ["Families who want a coastal small town", "Commuters", "Downsizers"],
    highlights: [
      "The Cedros Design District is one of North County's best shopping streets.",
      "The Belly Up has hosted major touring artists in an intimate club setting for decades.",
      "Fletcher Cove offers beach access and ocean-view picnic spots in the heart of town.",
      "The Solana Beach station has Coaster and Amtrak service.",
    ],
    homes:
      "Ocean-view condos along the coast, single-family homes in Lomas Santa Fe and Eden Gardens, and a limited supply of bluff-top homes.",
    schools: "Solana Beach School District for elementary grades and San Dieguito Union High School District.",
    pockets: ["Cedros", "Lomas Santa Fe", "Eden Gardens"],
    nearby: ["del-mar", "encinitas", "rancho-santa-fe"],
    coords: [32.9912, -117.2711],
  },
  {
    slug: "oceanside",
    name: "Oceanside",
    region: "North County Coastal",
    tagline: "A beach town on the rise",
    blurb: "A revitalized downtown, historic pier, and more attainable coastal prices.",
    description: [
      "Oceanside has changed dramatically over the last decade. A revitalized downtown with new restaurants and hotels sits steps from a classic wooden pier and some of the best beaches in North County.",
      "It still offers some of the most attainable coastal prices in the county, which makes it a strong fit for first-time buyers, military families from nearby Camp Pendleton, and buyers who want the beach without a La Jolla price tag.",
    ],
    bestFor: ["Military families", "First-time coastal buyers", "Investors"],
    highlights: [
      "The Oceanside Pier is one of the longest wooden piers on the West Coast.",
      "Mission San Luis Rey is the largest of California's historic missions.",
      "Oceanside Harbor offers boating, fishing, and waterfront dining.",
      "Camp Pendleton, the Marine Corps' major West Coast base, borders the city.",
    ],
    homes:
      "Beach cottages in South O, downtown condos, suburban single-family homes inland, and 55+ communities.",
    schools: "Mostly Oceanside Unified School District, with some areas in Vista Unified.",
    pockets: ["South O", "Downtown Oceanside", "Fire Mountain", "Rancho del Oro"],
    nearby: ["carlsbad", "san-marcos", "escondido"],
    coords: [33.1959, -117.3795],
  },
  {
    slug: "carmel-valley",
    name: "Carmel Valley",
    region: "North County Inland",
    tagline: "Top schools, minutes from the coast",
    blurb: "Master-planned neighborhoods with sought-after schools near Del Mar.",
    description: [
      "Carmel Valley is one of San Diego's most in-demand family neighborhoods, largely because of its schools — including Torrey Pines High School and Canyon Crest Academy — and its easy access to Del Mar's beaches.",
      "Homes are mostly from the 1990s onward, with parks, trails, and shopping at Del Mar Highlands and One Paseo. Its location near the Torrey Pines and Sorrento Valley job centers makes it a favorite with biotech and tech professionals.",
    ],
    bestFor: ["Families focused on schools", "Biotech & tech professionals", "Relocating buyers"],
    highlights: [
      "Served by the highly regarded Del Mar Union and San Dieguito Union school districts.",
      "One Paseo and Del Mar Highlands Town Center offer dining, shopping, and entertainment.",
      "The Carmel Valley and Los Peñasquitos trails are close by for hiking and biking.",
      "Just minutes from Del Mar, Torrey Pines, and the I-5 / SR-56 interchange.",
    ],
    homes:
      "Single-family homes built from the 1990s to today, townhomes, and condos, many in communities with pools and parks.",
    schools: "Del Mar Union and Solana Beach school districts for elementary grades; San Dieguito Union High School District, including Torrey Pines High and Canyon Crest Academy.",
    pockets: ["Pacific Highlands Ranch", "Torrey Hills", "Del Mar Mesa"],
    nearby: ["del-mar", "rancho-santa-fe", "scripps-ranch"],
    coords: [32.94, -117.225],
  },
  {
    slug: "rancho-santa-fe",
    name: "Rancho Santa Fe",
    region: "North County Inland",
    tagline: "Estate living, country quiet",
    blurb: "Acre-plus estates, equestrian trails, and one of the most prestigious addresses in the West.",
    description: [
      "Rancho Santa Fe is known for large estates, private golf clubs, and miles of riding trails — all wrapped around a charming village center designed by architect Lilian Rice.",
      "Within the Rancho Santa Fe Covenant, an association oversees architecture and land use, which protects the community's character but adds steps to any remodel or new build. Neighboring gated communities like Fairbanks Ranch and The Crosby offer a similar lifestyle with different rules.",
    ],
    bestFor: ["Estate & luxury buyers", "Equestrian families", "Buyers seeking privacy"],
    highlights: [
      "The village center's Spanish Revival architecture was designed by Lilian Rice in the 1920s.",
      "Miles of private riding and walking trails connect much of the Covenant.",
      "Home to several private golf and country clubs.",
      "About ten minutes to the beaches of Del Mar and Solana Beach.",
    ],
    homes:
      "Custom estates on one acre or more, equestrian properties, and luxury homes in gated golf communities.",
    schools: "Rancho Santa Fe School District for elementary and middle school; San Dieguito Union High School District.",
    pockets: ["The Covenant", "Fairbanks Ranch", "The Crosby", "Cielo"],
    nearby: ["solana-beach", "carmel-valley", "encinitas"],
    coords: [33.0203, -117.2028],
  },
  {
    slug: "scripps-ranch",
    name: "Scripps Ranch",
    region: "North County Inland",
    tagline: "Eucalyptus groves and lake trails",
    blurb: "A close-knit suburban community with strong schools and Lake Miramar.",
    description: [
      "Scripps Ranch feels like a small town inside the City of San Diego — tall eucalyptus trees, an active community association, and neighbors who show up for the Fourth of July parade.",
      "Lake Miramar's loop trail is the neighborhood's backyard, and quick freeway access to I-15 makes it an easy commute to employers in Sorrento Valley, Kearny Mesa, and downtown.",
    ],
    bestFor: ["Families", "Commuters on the I-15 corridor", "Buyers who want a strong community feel"],
    highlights: [
      "Lake Miramar's five-mile loop is popular with walkers, runners, and cyclists.",
      "Towering eucalyptus groves give the neighborhood its distinctive look.",
      "Served by Scripps Ranch High School and several well-regarded elementary schools.",
      "A long tradition of community events, from parades to farmers markets.",
    ],
    homes:
      "Single-family homes from the 1970s through the 2000s, many on generous lots, plus townhomes and condos.",
    schools: "San Diego Unified, including Scripps Ranch High School.",
    pockets: [],
    nearby: ["carmel-valley", "poway", "rancho-bernardo"],
    coords: [32.903, -117.1],
  },
  {
    slug: "rancho-bernardo",
    name: "Rancho Bernardo",
    region: "North County Inland",
    tagline: "Golf, trails, and Poway schools",
    blurb: "Established master-planned living with golf courses and 55+ communities.",
    description: [
      "Rancho Bernardo was one of San Diego's first master-planned communities, and it's aged gracefully: mature trees, golf courses, and neighborhoods that range from family homes to well-known 55+ communities.",
      "Most of Rancho Bernardo is served by Poway Unified, one of the most sought-after school districts in the county, while still being part of the City of San Diego.",
    ],
    bestFor: ["Families focused on schools", "Active retirees", "Golfers"],
    highlights: [
      "Served largely by Poway Unified School District.",
      "Several golf courses, including the course at the Rancho Bernardo Inn.",
      "Lake Hodges and the San Dieguito River trails are close by.",
      "Well-known 55+ communities with clubhouses and active social calendars.",
    ],
    homes:
      "1960s–80s single-story ranch homes, larger family homes in Bernardo Heights, condos and townhomes, and 55+ communities.",
    schools: "Poway Unified School District, including Rancho Bernardo High and Del Norte High.",
    pockets: ["Bernardo Heights", "Westwood", "Seven Oaks", "4S Ranch (adjacent)"],
    nearby: ["poway", "escondido", "scripps-ranch"],
    coords: [33.02, -117.075],
  },
  {
    slug: "poway",
    name: "Poway",
    region: "North County Inland",
    tagline: "The City in the Country",
    blurb: "Larger lots, horse properties, and one of the county's top school districts.",
    description: [
      "Poway calls itself \"The City in the Country,\" and it earns the name — larger lots, horse trails, and open space, just 25 minutes from downtown San Diego.",
      "Poway Unified is a major draw for families, and the city offers everything from starter homes to multi-acre estates in Green Valley and around StoneRidge.",
    ],
    bestFor: ["Families", "Equestrian & acreage buyers", "Outdoor lovers"],
    highlights: [
      "Lake Poway is the starting point for the famous Potato Chip Rock hike on Mount Woodson.",
      "Served by Poway Unified School District.",
      "Many neighborhoods are zoned for horses, with trails throughout the city.",
      "Old Poway Park hosts a historic steam train and a weekly farmers market.",
    ],
    homes:
      "Single-family homes on larger lots, horse properties, custom estates on acreage, and some townhomes.",
    schools: "Poway Unified School District, including Poway High.",
    pockets: ["Old Poway", "Green Valley", "StoneRidge"],
    nearby: ["rancho-bernardo", "scripps-ranch", "escondido"],
    coords: [32.9628, -117.0359],
  },
  {
    slug: "san-marcos",
    name: "San Marcos",
    region: "North County Inland",
    tagline: "Newer homes, close to everything",
    blurb: "Newer construction, a university town feel, and good value close to the coast.",
    description: [
      "San Marcos offers a lot of what buyers want in North County — newer homes, hiking trails, and good schools — at prices often below the coastal cities, about 20 minutes from the beach.",
      "San Elijo Hills and the neighborhoods around Double Peak are especially popular with families, while Lake San Marcos offers a quieter, lakeside lifestyle.",
    ],
    bestFor: ["Growing families", "Move-up buyers", "Buyers who want newer construction"],
    highlights: [
      "Double Peak Park offers panoramic views from the coast to the mountains.",
      "Home to Cal State San Marcos and Palomar College.",
      "San Elijo Hills is a master-planned community with its own town center.",
      "Easy access to Carlsbad beaches via SR-78.",
    ],
    homes:
      "Newer master-planned single-family homes, townhomes, lakeside homes, and 55+ communities.",
    schools: "San Marcos Unified School District.",
    pockets: ["San Elijo Hills", "Lake San Marcos", "Santa Fe Hills"],
    nearby: ["carlsbad", "escondido", "oceanside"],
    coords: [33.1434, -117.1661],
  },
  {
    slug: "escondido",
    name: "Escondido",
    region: "North County Inland",
    tagline: "Space, value, and wine country",
    blurb: "Larger lots, historic homes, and some of the best value in North County.",
    description: [
      "Escondido offers more house and more land for the money than almost anywhere else in North County — from Victorian and Craftsman homes in Old Escondido to ranch properties in the surrounding hills.",
      "It's also home to the San Diego Zoo Safari Park, Stone Brewing's flagship, and a growing number of wineries in the nearby valleys.",
    ],
    bestFor: ["Value-focused buyers", "Buyers wanting land or ADU space", "First-time buyers"],
    highlights: [
      "The San Diego Zoo Safari Park is located in Escondido's San Pasqual Valley.",
      "Old Escondido is a historic district of restored Victorian and Craftsman homes.",
      "Grand Avenue's downtown hosts a popular weekly classic car night.",
      "The California Center for the Arts brings concerts, theater, and museum exhibits.",
    ],
    homes:
      "Historic homes, mid-century ranches, newer subdivisions, and acreage properties in the surrounding hills.",
    schools: "Escondido Union School District and Escondido Union High School District, plus charter options.",
    pockets: ["Old Escondido", "Harmony Grove", "Hidden Meadows"],
    nearby: ["san-marcos", "rancho-bernardo", "poway"],
    coords: [33.1192, -117.0864],
  },
  {
    slug: "chula-vista",
    name: "Chula Vista",
    region: "South Bay & East County",
    tagline: "Newer homes, bayfront future",
    blurb: "The county's second-largest city, with master-planned communities and a growing bayfront.",
    description: [
      "Chula Vista is the second-largest city in San Diego County, and its eastern half is filled with newer master-planned communities like Eastlake and Otay Ranch — parks, trails, and schools built alongside the homes.",
      "It offers more space for the money than most of the county, about 15 minutes from downtown San Diego. The bayfront is in the middle of a major transformation with new parks, a resort, and waterfront amenities.",
    ],
    bestFor: ["Families wanting newer homes", "First-time & move-up buyers", "Military families"],
    highlights: [
      "Eastlake and Otay Ranch are among the largest master-planned communities in the county.",
      "The Chula Vista Bayfront is being redeveloped with parks, a resort, and a marina district.",
      "The Chula Vista Elite Athlete Training Center has hosted Olympic hopefuls for decades.",
      "Quick access to downtown San Diego, Coronado, and the border.",
    ],
    homes:
      "Newer single-family homes and townhomes in master-planned communities, plus older ranch homes on larger lots in western Chula Vista.",
    schools: "Chula Vista Elementary School District and Sweetwater Union High School District.",
    pockets: ["Eastlake", "Otay Ranch", "Rolling Hills Ranch", "Bonita (adjacent)"],
    nearby: ["coronado", "downtown-san-diego", "la-mesa"],
    coords: [32.6401, -117.0842],
  },
  {
    slug: "la-mesa",
    name: "La Mesa",
    region: "South Bay & East County",
    tagline: "The Jewel of the Hills",
    blurb: "A walkable village, mid-century homes, and Mount Helix views.",
    description: [
      "La Mesa has a small-town downtown — La Mesa Village — with local restaurants, a trolley stop, and one of San Diego's best-loved Oktoberfests.",
      "Mid-century ranch homes on generous lots make it a favorite for buyers who want space and character without leaving the urban core, and the hillsides around Mount Helix offer some of the best views in East County.",
    ],
    bestFor: ["Families", "Mid-century home lovers", "Buyers who want value near the city"],
    highlights: [
      "La Mesa Village is walkable, with local shops, restaurants, and a trolley station.",
      "La Mesa Oktoberfest is one of the largest in Southern California.",
      "Mount Helix's summit offers 360-degree views of the county.",
      "Lake Murray's trails and water are right on the city's edge.",
    ],
    homes:
      "Mid-century ranch homes, Craftsman bungalows near the Village, view homes on Mount Helix, and condos near the trolley.",
    schools: "La Mesa-Spring Valley School District and Grossmont Union High School District.",
    pockets: ["La Mesa Village", "Mount Helix", "Lake Murray", "Grossmont"],
    nearby: ["north-park", "chula-vista", "scripps-ranch"],
    coords: [32.7678, -117.0231],
  },
];

export function getArea(slug: string) {
  return areas.find((a) => a.slug === slug);
}

export const featuredAreas = areas.filter((a) => a.featured);
