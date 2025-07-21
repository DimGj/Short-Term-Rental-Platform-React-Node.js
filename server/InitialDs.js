const fs = require('fs');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const imageToBase64 = require('image-to-base64')

async function generateData(){
  // Generate random telephone numbers
  function generateRandomPhoneNumber() {
    const phoneNumber = '69' + Math.floor(10000000 + Math.random() * 90000000); // Generates a Greek mobile number
    return parseInt(phoneNumber, 10);
  }

  // Create an array to store user data
  const userData = [];

  // Create arrays to store user IDs with 'host' and 'client' roles
  const hostUserIds = [];
  const clientUserIds = [];

  // Generate 66 users with 'host' role
  for (let i = 2; i <= 67; i++) { // 67 to generate 66 users (starting from 2)
    const pastDate = faker.date.past({ years: 5}).toISOString().slice(0, -5).replace('T',' ')
    const user = {
      username: faker.internet.userName().substring(0, 20),
      password: bcrypt.hashSync(`password${i}`, 10), // Hash the password
      firstname: faker.person.firstName(), // Generate a random firstname
      lastname: faker.person.firstName(), // Generate a random lastname
      email: faker.internet.email(), // Generate a random email
      telephone: generateRandomPhoneNumber(), // Random telephone number
      avatar: null,
      searchedRoomId: null, // Set 'searchedRoomId' to null for 'host'
      role: 'host',
      status: 'accepted',
      createdAt: pastDate,
      updatedAt: pastDate
    };

    hostUserIds.push(i); // Store the user ID in the 'hostUserIds' array

    userData.push(user);
  }

  // Generate 133 users with 'client' role
  for (let i = 68; i <= 200; i++) { // 1133 users (starting from 68)
    const pastDate = faker.date.past({ years: 5}).toISOString().slice(0, -5).replace('T',' ')
    const user = {
      username: faker.internet.userName().substring(0, 20),
      password: bcrypt.hashSync(`password${i}`, 10), // Hash the password
      firstname: faker.person.firstName(), // Generate a random firstname
      lastname: faker.person.firstName(), // Generate a random lastname
      email: faker.internet.email(), // Generate a random email
      telephone: generateRandomPhoneNumber(), // Random telephone number
      avatar: null,
      searchedRoomId: '', 
      role: 'client',
      status: 'accepted',
      createdAt: pastDate,
      updatedAt: pastDate
    };

    clientUserIds.push(i); // Store the user ID in the 'clientUserIds' array

    // Generate random visited room IDs (0 to 75 rooms)
    const numVisitedRooms = Math.floor(Math.random() * 31); //max 30 rooms visited each user
    const searchedRoomIds = [];

    for (let j = 0; j < numVisitedRooms; j++) {
      searchedRoomIds.push(faker.number.int({ min: 1, max: 75 }));
    }

    // Convert the array of IDs to a comma-separated string
    const searchedRoomIdString = searchedRoomIds.join(',');

    // Assign the searchedRoomIdString to the user's searchedRoomId field
    user.searchedRoomId = searchedRoomIdString;

    userData.push(user);
  }

  // Write the json data to a file
  fs.writeFileSync('C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/user_data.json', JSON.stringify(userData, null, 2), 'utf-8');

  console.log('User data has been generated and saved to user_data.json');

  // Create an array to store room data
  const roomData = [];

  const neighborhoods = [
    'Notting Hill', 'Soho', 'Camden Town', 'Shoreditch', 'Kensington',
    'Sol', 'Malasaña', 'Lavapiés', 'Chueca', 'La Latina',
    'Trastevere', 'Monti', 'Testaccio', 'Prati', 'Pigneto',
    'Chaoyang', 'Dongcheng', 'Xicheng', 'Haidian', 'Fengtai',
    'Hollywood', 'Venice Beach', 'Beverly Hills', 'Downtown', 'Santa Monica',
    'Lapa', 'Ipanema', 'Copacabana', 'Santa Teresa', 'Botafogo'
  ];

  const roomTypeValues = [
    'Entire home/apt',
    'Shared room',
    'Shared room',
  ];
  const cleanedRoomTypeValues = roomTypeValues.map((value) => value.trim());

  // Generate 75 rooms
  for (let i = 1; i <= 75; i++) {
    const pastDate = faker.date.past({ years: 10, refDate: '2018-01-01T00:00:00.000Z'}).toISOString().slice(0, -5).replace('T',' ')
    const street = faker.location.streetAddress(false)
    const zipcode = faker.number.int({ min: 10000, max: 19999 })
    const neighborhood = neighborhoods[faker.number.int({ min: 0, max: 29 })]
    const city = faker.location.city()
    const state = faker.location.state()
    const country = faker.location.country()
    const room = {
      name: faker.lorem.words(3), // Generate a random room name
      description: faker.lorem.sentence(), // Generate a random description
      street: street, // Generate a random street name
      zipcode: zipcode,
      neighborhood: neighborhood, // Generate a random neighborhood name
      city: city, // Generate a random city name
      state: faker.location.state(), // Generate a random state name
      country: faker.location.country(), // Generate a random country name
      address: [street, neighborhood, city, state, zipcode, country].join(', '),
      latitude: faker.location.latitude().toString(), // Generate a random latitude
      longitude: faker.location.longitude().toString(), // Generate a random longitude
      room_type: faker.helpers.arrayElement(cleanedRoomTypeValues), // Random room type
      neighborhood_description: faker.lorem.sentence(), // Generate a neighborhood description
      transport: faker.lorem.sentence(), // Generate a random list of transports
      accommodates: faker.number.int({ min: 3, max: 8 }), // Random number of accommodates
      bathrooms: faker.number.int({ min: 1, max: 4 }), // Random number of bathrooms
      bedrooms: faker.number.int({ min: 1, max: 5 }), // Random number of bedrooms
      beds: faker.number.int({ min: 1, max: 5 }), // Random number of beds
      has_couch: faker.datatype.boolean({ probability: 0.8 }), // Random value for has_couch
      amenities: faker.helpers.arrayElements(['Wireless Internet','Cooler','Heating','Kitchen','TV','Parking','Elevator','Doorman','Shampoos','Jacuzzi','Breakfast','Sea View'], { min: 3, max: 10 }).join(','), // Generate a random list of amenities
      pets_allowed: faker.datatype.boolean({ probability: 0.3 }), // Random value for pets_allowed
      smoking_allowed: faker.datatype.boolean({ probability: 0.4 }), // Random value for smoking_allowed
      events_allowed: faker.datatype.boolean({ probability: 0.7 }), // Random value for events_allowed
      surface: faker.number.int({ min: 10, max: 200 }), // Random surface area
      price: faker.number.int({ min: 20, max: 300 }), // Random price
      extraPersonPrice: faker.number.int({ min: 10, max: 40 }), // Random extra person price
      startingRentingDate: faker.date.past({ years: 5 }).toISOString().slice(0,10), // Random past date
      endingRentingDate: faker.date.future({ years: 10 , refDate: '2024-01-01T00:00:00.000Z' }).toISOString().slice(0,10),
      minimum_nights: faker.number.int({ min: 1, max: 5 }), // Random minimum nights
      thumbnail: null,
      photos: null,
      number_of_reviews: faker.number.int({ min: 0, max: 100 }), // Random number of reviews
      rating: faker.number.float({ min: 2, max: 5, precision: 0.01 }), // rating between 1.00 and 5.00
      userId: faker.helpers.arrayElement(hostUserIds), // Assign a random user ID from hostUserIds
      createdAt: pastDate,
      updatedAt: pastDate
    };
    
    roomData.push(room);
  }

  // Write room data to a JSON file
  fs.writeFileSync('C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/room_data.json', JSON.stringify(roomData, null, 2), 'utf-8')

  console.log('Room data has been generated and saved to room_data.json')

  // Create an array to store booking data
  const bookingData = []

  // Generate 200 booking entries
  for (let i = 1; i <= 200; i++) {
    // Generate random check-in and check-out dates between October 2023 and February 2024
    const checkInDate = faker.date.between({ from: '2023-10-01', to: '2024-01-31' }).toISOString().slice(0, 10)
    const checkOutDate = faker.date.between({ from: checkInDate, to: '2024-02-29'}).toISOString().slice(0, 10)

    // Generate random number of people (1 to 8)
    const numberOfPeople = faker.number.int({ min: 1, max: 5 })

    // Calculate a random total price based on the number of people and room price
    const roomPrice = faker.number.int({ min: 80, max: 800 })
    const extraPersonPrice = faker.number.int({ min: 10, max: 40 })
    const totalPrice = roomPrice + (numberOfPeople - 1) * extraPersonPrice

    // Generate a random review and rating (if the booking has been reviewed)
    const hasReview = faker.datatype.boolean({  probability: 0.7 })
    const review = hasReview ? faker.lorem.sentence() : null
    const rating = hasReview ? faker.number.int({ min: 1, max: 5 }) : null

    // Generate random user IDs (client) and room IDs
    const userId = faker.number.int({ min: 68, max: 200 }) // Assuming user IDs for clients are from 68 to 200
    const roomId = faker.number.int({ min: 1, max: 75 })

    // Create a booking object
    const booking = {
      checkInDate,
      checkOutDate,
      numberOfPeople,
      totalPrice,
      review,
      rating,
      roomId,
      userId,
    }

    bookingData.push(booking)
  }

  // Write booking data to a JSON file
  fs.writeFileSync('C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/bookings_data.json', JSON.stringify(bookingData, null, 2), 'utf-8')

  console.log('Booking data has been generated and saved to bookings_data.json')
}

generateData().catch((error) => {
  console.error('Error generating data:', error);
});