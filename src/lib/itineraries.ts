// "A day in…" itineraries for each neighborhood page, keyed by area slug.
// These stick to lasting landmarks (beaches, trails, parks, main streets)
// rather than individual businesses, so they don't go stale. Lara: swap in
// your own favorite coffee spot or dinner place anytime — that personal touch
// is what makes these land.

export type Moment = "Morning" | "Midday" | "Afternoon" | "Evening";

export type Stop = {
  when: Moment;
  title: string;
  text: string;
};

export const itineraries: Record<string, Stop[]> = {
  "la-jolla": [
    { when: "Morning", title: "Coast walk to the seals", text: "Walk the bluff path from La Jolla Cove to Children's Pool while it's quiet, with sea lions and harbor seals on the rocks below." },
    { when: "Midday", title: "Kayak the Shores", text: "La Jolla Shores has one of the gentlest beach entries on the coast — rent a kayak or snorkel the Ecological Reserve." },
    { when: "Afternoon", title: "Torrey Pines trails", text: "Ten minutes north, the cliffside trails of Torrey Pines State Natural Reserve open onto some of the best views in California." },
    { when: "Evening", title: "Sunset and the Village", text: "Catch sunset over the Cove, then stroll to dinner along Prospect Street and the Village's side streets." },
  ],
  "del-mar": [
    { when: "Morning", title: "Dog Beach", text: "Start at North Beach by the river mouth, where dogs run off-leash and the morning surf is usually glassy." },
    { when: "Midday", title: "Lunch with a view", text: "Head up to Camino Del Mar for a long lunch on a terrace overlooking the ocean." },
    { when: "Afternoon", title: "Lagoon or the track", text: "Walk the San Dieguito Lagoon trails — or, from mid-July to early September, spend the afternoon at the Del Mar races." },
    { when: "Evening", title: "Powerhouse Park sunset", text: "Bring a blanket to the lawn at Powerhouse Park for one of the most loved sunsets in North County." },
  ],
  coronado: [
    { when: "Morning", title: "Bike the bay", text: "Coronado is flat and bike-friendly — ride the bayside path past the Ferry Landing with the downtown skyline across the water." },
    { when: "Midday", title: "Orange Avenue", text: "Browse the shops and grab lunch along Orange Avenue, the island's easygoing main street." },
    { when: "Afternoon", title: "Central Beach", text: "Spend the afternoon on the wide, sparkling sand in front of the Hotel del Coronado — consistently ranked among the best beaches in the country." },
    { when: "Evening", title: "Skyline at dusk", text: "Watch the city lights come on across the bay from Centennial Park." },
  ],
  carlsbad: [
    { when: "Morning", title: "Seawall run", text: "Walk or run the seawall along Carlsbad Boulevard, with surfers below and the Village just ahead." },
    { when: "Midday", title: "Carlsbad Village", text: "Lunch and browsing on State Street, a few blocks from the beach and the Coaster station." },
    { when: "Afternoon", title: "Flowers or the lagoon", text: "In spring, the Flower Fields bloom in bands of color; the rest of the year, walk the Batiquitos Lagoon trail." },
    { when: "Evening", title: "Tamarack sunset", text: "End the day on the sand at Tamarack Beach as the sun drops into the Pacific." },
  ],
  encinitas: [
    { when: "Morning", title: "Surf check at Swami's", text: "Watch (or join) the lineup at Swami's, one of California's legendary surf breaks, from the bluff above." },
    { when: "Midday", title: "Coast Highway 101", text: "Wander downtown Encinitas for lunch, surf shops, and the historic La Paloma Theatre marquee." },
    { when: "Afternoon", title: "Gardens or Moonlight Beach", text: "Explore the San Diego Botanic Garden, or grab a spot at family-favorite Moonlight Beach." },
    { when: "Evening", title: "Leucadia nights", text: "Drift north to Leucadia's laid-back stretch of the 101 for dinner under the eucalyptus trees." },
  ],
  "point-loma": [
    { when: "Morning", title: "Cabrillo & the lighthouse", text: "Visit Cabrillo National Monument and the Old Point Loma Lighthouse — and the tide pools if it's low tide." },
    { when: "Midday", title: "Liberty Station", text: "Lunch at the former Naval Training Center, now a campus of restaurants, galleries, and green lawns." },
    { when: "Afternoon", title: "Shelter Island", text: "Stroll the waterfront path past sailboats and yacht clubs, with views back to downtown." },
    { when: "Evening", title: "Sunset Cliffs", text: "Finish at Sunset Cliffs Natural Park — the name says it all." },
  ],
  "pacific-beach": [
    { when: "Morning", title: "Boardwalk ride", text: "Cruise the oceanfront boardwalk on a beach cruiser up to Crystal Pier." },
    { when: "Midday", title: "Garnet Avenue", text: "Tacos and people-watching on Garnet, PB's lively main drag." },
    { when: "Afternoon", title: "Paddle Mission Bay", text: "Trade waves for flat water — paddleboard or kayak on the calm bay side." },
    { when: "Evening", title: "Tourmaline at golden hour", text: "Watch the longboarders at Tourmaline Surf Park as the light turns gold." },
  ],
  "mission-beach": [
    { when: "Morning", title: "Jetty run", text: "Run the boardwalk south to the Mission Beach jetty before the crowds arrive." },
    { when: "Midday", title: "Belmont Park", text: "Ride the Giant Dipper, a 1920s wooden roller coaster that's a National Historic Landmark." },
    { when: "Afternoon", title: "Bayside", text: "Cross the narrow peninsula to the bay side for calm water, sailing, and a quieter beach." },
    { when: "Evening", title: "Two-sided sunset", text: "Watch sunset on the ocean side, then walk home along the bay as the lights come on." },
  ],
  "ocean-beach": [
    { when: "Morning", title: "Dog Beach", text: "OB's Dog Beach was one of the first leash-free beaches in the country — expect a lot of happy dogs." },
    { when: "Midday", title: "Newport Avenue", text: "Antique stores, surf shops, and fish tacos on OB's classic main street." },
    { when: "Afternoon", title: "Tide pools", text: "At low tide, explore the pools along the Sunset Cliffs shoreline just south of town." },
    { when: "Evening", title: "Wednesday market", text: "On Wednesdays, the farmers market takes over Newport Avenue — grab dinner there and walk to the water for sunset." },
  ],
  "downtown-san-diego": [
    { when: "Morning", title: "Waterfront walk", text: "Walk the Embarcadero past the USS Midway and Seaport Village, with the bay on one side and the skyline on the other." },
    { when: "Midday", title: "Little Italy", text: "Lunch in Little Italy — on Saturdays, the Mercato farmers market fills the streets." },
    { when: "Afternoon", title: "Balboa Park", text: "A short ride to Balboa Park's museums, gardens, and Spanish Revival architecture." },
    { when: "Evening", title: "Petco Park or the Gaslamp", text: "Catch a Padres game or dinner in the Gaslamp Quarter — all walkable from home." },
  ],
  "mission-hills": [
    { when: "Morning", title: "Presidio Park", text: "Walk the hillside paths of Presidio Park, the site of California's first European settlement." },
    { when: "Midday", title: "Neighborhood village", text: "Lunch at the small shops and cafés along Washington Street." },
    { when: "Afternoon", title: "Historic home stroll", text: "Wander streets of Craftsman and Spanish Revival homes — some of the best-preserved architecture in the city." },
    { when: "Evening", title: "Little Italy, five minutes down", text: "Head downhill to Little Italy or over to Hillcrest for dinner." },
  ],
  "north-park": [
    { when: "Morning", title: "Coffee on 30th", text: "Start with coffee on 30th Street, then walk to Morley Field and the east edge of Balboa Park." },
    { when: "Midday", title: "University Avenue", text: "Vintage shops, record stores, and lunch along University Avenue." },
    { when: "Afternoon", title: "Craft beer row", text: "North Park is the heart of San Diego's craft beer scene — several breweries are within a few blocks." },
    { when: "Evening", title: "Thursday market & live music", text: "On Thursdays, the farmers market sets up in the afternoon; stay for dinner and live music on University." },
  ],
  "solana-beach": [
    { when: "Morning", title: "Fletcher Cove", text: "Coffee and a beach walk at Fletcher Cove, Solana Beach's easygoing town beach." },
    { when: "Midday", title: "Cedros Design District", text: "Browse the design shops, galleries, and cafés along Cedros Avenue." },
    { when: "Afternoon", title: "San Elijo Lagoon", text: "Walk the trails of the San Elijo Lagoon Ecological Reserve, great for birdwatching." },
    { when: "Evening", title: "The Belly Up", text: "See a show at the Belly Up, the legendary music venue that's been drawing big names since the 1970s." },
  ],
  oceanside: [
    { when: "Morning", title: "Harbor morning", text: "Watch the fishing boats head out from Oceanside Harbor and the surfers at Harbor Beach." },
    { when: "Midday", title: "Mission San Luis Rey", text: "Visit the “King of the Missions,” the largest of California's historic missions." },
    { when: "Afternoon", title: "The Strand", text: "Walk The Strand along the beach and stop by the California Surf Museum downtown." },
    { when: "Evening", title: "Sunset Market", text: "Thursday evenings, downtown's Sunset Market fills the streets with food and music." },
  ],
  "carmel-valley": [
    { when: "Morning", title: "School run & coffee", text: "Many families here walk or bike to school — then coffee at one of the neighborhood centers." },
    { when: "Midday", title: "One Paseo", text: "Lunch and errands at One Paseo or Del Mar Highlands, both a short drive from most streets." },
    { when: "Afternoon", title: "Parks and trails", text: "Carmel Valley's parks, sports fields, and canyon trails keep afternoons busy." },
    { when: "Evening", title: "Beach in ten minutes", text: "Head west to Torrey Pines State Beach for sunset — it's closer than most people think." },
  ],
  "rancho-santa-fe": [
    { when: "Morning", title: "Trail ride", text: "The Covenant is laced with miles of private riding and walking trails through eucalyptus groves." },
    { when: "Midday", title: "The Village", text: "Lunch in the Village, whose 1920s Spanish-style buildings were designed by architect Lilian Rice." },
    { when: "Afternoon", title: "A round of golf", text: "Spend the afternoon on one of the community's private golf courses." },
    { when: "Evening", title: "Del Mar sunset", text: "The coast is about 15 minutes away — dinner in Del Mar, home under the stars." },
  ],
  "scripps-ranch": [
    { when: "Morning", title: "Lake Miramar loop", text: "Walk, run, or bike the paved five-mile loop around Lake Miramar." },
    { when: "Midday", title: "Everyday errands", text: "Neighborhood shopping centers make errands quick and easy." },
    { when: "Afternoon", title: "Evans Pond & eucalyptus streets", text: "Scripps Ranch's tree-lined streets and Evans Pond give it a quiet, woodland feel unusual for San Diego." },
    { when: "Evening", title: "Community life", text: "This is a close-knit neighborhood — think school events, youth sports, and the famous Fourth of July parade." },
  ],
  "rancho-bernardo": [
    { when: "Morning", title: "Lake Hodges", text: "Hike or bike the trails around Lake Hodges and cross the pedestrian bridge." },
    { when: "Midday", title: "Bernardo Winery", text: "Lunch at Bernardo Winery, operating since 1889 and one of the oldest in Southern California." },
    { when: "Afternoon", title: "Golf country", text: "Rancho Bernardo has several golf courses, including the one at the Rancho Bernardo Inn." },
    { when: "Evening", title: "Easy evenings", text: "Quiet streets, mild weather, and a short drive to dinner in 4S Ranch or Poway." },
  ],
  poway: [
    { when: "Morning", title: "Iron Mountain", text: "Hike Iron Mountain, one of the most popular summit trails in the county — or Mount Woodson's Potato Chip Rock." },
    { when: "Midday", title: "Old Poway Park", text: "On weekends, ride the historic train at Old Poway Park." },
    { when: "Afternoon", title: "Lake Poway", text: "Fish, rent a boat, or picnic on the lawn at Lake Poway." },
    { when: "Evening", title: "A show in town", text: "Catch a performance at the Poway Center for the Performing Arts." },
  ],
  "san-marcos": [
    { when: "Morning", title: "Double Peak", text: "Hike or drive up to Double Peak Park for views from the mountains to the ocean." },
    { when: "Midday", title: "San Elijo Hills", text: "Lunch in the San Elijo Hills town center, the heart of one of the county's popular master-planned communities." },
    { when: "Afternoon", title: "Hop Highway", text: "San Marcos sits on North County's “Hop Highway,” with craft breweries a short drive apart." },
    { when: "Evening", title: "North City", text: "Dinner in North City, the walkable district near Cal State San Marcos." },
  ],
  escondido: [
    { when: "Morning", title: "Safari Park", text: "Beat the heat at the San Diego Zoo Safari Park in the San Pasqual Valley." },
    { when: "Midday", title: "Grand Avenue", text: "Lunch and antiques along Grand Avenue in historic downtown." },
    { when: "Afternoon", title: "Brewery & winery country", text: "Visit Stone Brewing's gardens or one of the small wineries in the surrounding valleys." },
    { when: "Evening", title: "California Center for the Arts", text: "See a concert or show at the city's performing arts center." },
  ],
  "chula-vista": [
    { when: "Morning", title: "The bayfront", text: "Walk the Chula Vista Bayfront and visit the Living Coast Discovery Center." },
    { when: "Midday", title: "Third Avenue Village", text: "Lunch in the historic downtown along Third Avenue." },
    { when: "Afternoon", title: "Otay Lakes", text: "Head east to Otay Lakes, home to the Chula Vista Elite Athlete Training Center." },
    { when: "Evening", title: "Otay Ranch", text: "Dinner and a movie at Otay Ranch Town Center, close to many of the newer neighborhoods." },
  ],
  "la-mesa": [
    { when: "Morning", title: "Lake Murray", text: "Walk or bike the paved path along Lake Murray at sunrise." },
    { when: "Midday", title: "La Mesa Village", text: "Lunch in the walkable Village, right by the trolley." },
    { when: "Afternoon", title: "Mount Helix", text: "Drive up to Mount Helix for 360-degree views of the county." },
    { when: "Evening", title: "Village nights", text: "Dinner back in the Village — and in early fall, La Mesa's famous Oktoberfest." },
  ],
};
