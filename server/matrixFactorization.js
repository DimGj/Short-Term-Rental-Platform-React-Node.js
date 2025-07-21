

const { user , room, booking } = require('./models')

async function GetRecommendations(userId) {
    //Get all the needed data from the database
    var users = await user.findOne({
        order: [
            ['id', 'DESC']
        ]
    }).catch(error => { return res.status(400).json( JSON.parse(error.errors[0].message) ) })
    
    var rooms = await await room.findOne({
        order: [
            ['id', 'DESC']
        ]
    }).catch(error => { return res.status(400).json( JSON.parse(error.errors[0].message) ) })

    const bookings = await booking.findAll({
        attributes: ['userId', 'roomId', 'rating'],
      }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message) ) })
    const userRatingsAndBookings = bookings.map((booking) => booking.dataValues) 
    
    const allUsersId = await user.findAll({
        attributes: ['id'],
        where: {
            role: 'client'
        }
    })
    const visitedRoomIds = [] 
    for (const userInstance of allUsersId) { //Loop through each user and get their visited room IDs
        const userId = userInstance.id
        const userVisits = await user.findOne({
            attributes: ['searchedRoomId'],
            where: {
                id: userId,
            }
        })

        if (userVisits && userVisits.searchedRoomId) {  //if user has visited at least one room ID, store them all 
            const visitedRooms = userVisits.searchedRoomId.split(',').map(Number)
            visitedRooms.forEach(roomId => {
                visitedRoomIds.push({ userId, searchedRoomId: roomId })
            })
        }
    }


    // Hyperparameters
    const numLatentFeatures = 5 // Number of latent features
    const learningRate = 0.001   // Learning rate (η)

    //random initialization
    let V = []
    for (let i = 0; i < users.id; i++) {
        V[i] = []
        for (let k = 0; k < numLatentFeatures; k++) {
            V[i][k] = Math.random() // Initialize with random values
        }
    }

    let F = []
    for (let k = 0; k < numLatentFeatures; k++) {
        F[k] = []
        for (let j = 0; j < rooms.id; j++) {
            F[k][j] = Math.random() // Initialize with random values
        }
    }

    const maxIterations = 100   // Maximum number of iterations if convergence is not achieved
    const convergenceThreshold = 0.001 //RMSE convergence limit

    let previousRMSE = Infinity

    const userProfileVectors = Array(users.id).fill(0).map(() => Array(rooms.id).fill(0)) //initialize a 2D array to store user's visit history
    for (const searchedRoom of visitedRoomIds) {
        const { userId, searchedRoomId } = searchedRoom

        if (searchedRoomId !== undefined)
            userProfileVectors[userId - 1][searchedRoomId - 1] += 1 //if room was visited make it 1
    }

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let totalSquaredError = 0

        for (const { userId, roomId, rating } of userRatingsAndBookings) {
            if (rating === null)
                continue
            
            let prediction = 0  //eij prediction error
            for (let k = 0; k < numLatentFeatures; k++) {
                prediction += V[userId - 1][k] * F[k][roomId - 1]
            }
            const error = rating - prediction

            //update V and F using gradient descent
            for (let k = 0; k < numLatentFeatures; k++) {
                const gradientV = -2 * error * F[k][roomId - 1]
                const gradientF = -2 * error * V[userId - 1][k]
                V[userId - 1][k] -= learningRate * gradientV
                F[k][roomId - 1] -= learningRate * gradientF
            }

            
            totalSquaredError += error ** 2 //total squared error
        }
        const rmse = Math.sqrt(totalSquaredError / userRatingsAndBookings.length)

        if (Math.abs(previousRMSE - rmse) < convergenceThreshold) //check the convergence
            break

        previousRMSE = rmse
    }

    const recommendations = []
    //check whether user has at least one booking/rating
    if (userRatingsAndBookings.some((bookingIn) => bookingIn.userId == userId && bookingIn.rating != null)) {
        for (let roomId = 1; roomId <= rooms.id; roomId++) {
            if (!userRatingsAndBookings.some((bookingIn) => bookingIn.userId === userId && bookingIn.roomId === roomId)) {
                //room must not have been booked by the user
                let prediction = 0
                for (let k = 0; k < numLatentFeatures; k++) {
                    prediction += V[userId - 1][k] * F[k][roomId - 1]
                }
                recommendations.push({ roomId, predictedRating: prediction })
            }
        }
    } 
    else 
    {
        // User has no bookings with ratings, find the most similar user with at least one booking and rating
        let mostSimilarUser = null
        let highestSimilarityScore = -1

        for (let userId2 = 1; userId2 <= users.id; userId2++) {
            if (userId2 !== userId) {
                const otherUserHasBookings = userRatingsAndBookings.some((bookingIn) => bookingIn.userId === userId2 && bookingIn.rating !== null) //Check if the other user has bookings with rating
                if (otherUserHasBookings) {
                    const similarityScore = calculateVectorSimilarity(userProfileVectors[userId - 1], userProfileVectors[userId2 - 1]) //compare the similarity between the user's profile  and other users' profile
                    if (similarityScore > highestSimilarityScore) { // Update the most similar user if a higher similarity score is found
                        highestSimilarityScore = similarityScore
                        mostSimilarUser = userId2
                    }
                }
            }
        }

        //use their booking and rating history to make recommendations
        for (let roomId = 1; roomId <= rooms.id; roomId++) {
            if (!userRatingsAndBookings.some((bookingIn) => bookingIn.userId === mostSimilarUser && bookingIn.roomId === roomId)) {
                //room must not have been booked by the user
                let prediction = 0
                for (let k = 0; k < numLatentFeatures; k++) {
                    prediction += V[mostSimilarUser - 1][k] * F[k][roomId - 1]
                }
                recommendations.push({ roomId, predictedRating: prediction })
            }
        }
    }

    recommendations.sort((a, b) => b.predictedRating - a.predictedRating)
    
    //get room details for all rooms so after to filter only the room ids that exist
    const roomDetails = await room.findAll().catch(error => {
        throw new Error(JSON.parse(error.errors[0].message))
    });

    const recommendationsWithDetails = recommendations
        .filter(recommendation => { return roomDetails.find(room => room.id === recommendation.roomId) })

    return recommendationsWithDetails.slice(0,5)
}


//Helping function to calculate cosine similarity
function calculateVectorSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length)
        throw new Error("Vectors must have the same dimensionality.")

    //calculate the dot product of vectors
    let dotProduct = 0
    let magnitude1 = 0
    let magnitude2 = 0

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i]
        magnitude1 += vec1[i] * vec1[i]
        magnitude2 += vec2[i] * vec2[i]
    }

    //calculate the magnitudes
    magnitude1 = Math.sqrt(magnitude1)
    magnitude2 = Math.sqrt(magnitude2)

    //calculate the cosine similarity
    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0 // in case of division by zero
    } else {
        return dotProduct / (magnitude1 * magnitude2)
    }
}

module.exports = { GetRecommendations }