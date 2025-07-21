module.exports = (sequelize , DataTypes) => {
    const room = sequelize.define("room", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            unique: {
                args: true,
                msg: JSON.stringify({ error: 913 , msg: "Ο τίτλος χρησιμοποιείται ήδη"})
            },
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            unique: {
                args: true,
                msg: JSON.stringify({ error: 914 , msg: "Η περιγραφή ειναί ίδια με άλλο δωμάτιο"})
            },
            allowNull: false
        },
        street: {
            type: DataTypes.STRING,
            allowNull: false
        },
        zipcode: {
            type: DataTypes.INTEGER(5),
            allowNull: false,
            validate: {
                len: {
                    args: [5],  
                    msg:  JSON.stringify({ error: 915, msg: "Μη έγκυρος ταχυδρομικάς κώδικας" })
                }
            }
        },
        neighborhood: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            set() {
                this.setDataValue('address', this.street + ', ' + this.neighborhood + ', ' + this.city + ', ' + this.state + ', ' + this.zipcode + ', ' + this.country)
            }
        },
        latitude: {
            type: DataTypes.STRING,
            allowNull: false
        },
        longitude: {
            type: DataTypes.STRING,
            allowNull: false
        },
        room_type: {
            type: DataTypes.ENUM,
            values: ['Entire home/apt', 'Private room', 'Shared room'],
            allowNull: false,
            validate: {
                isIn: { 
                    args: [['Entire home/apt', 'Private room', 'Shared room']] ,
                    msg: JSON.stringify({ error: 909 , msg: "Προέκυψε σφάλμα. Παρακαλώ ξαναπροσπαθήστε"})
                }
            }
        },
        neighborhood_description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        transport: {
            type: DataTypes.STRING,
            allowNull: false
        },
        accommodates: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bathrooms: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        bedrooms: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        beds: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        has_couch: {
            type: DataTypes.BOOLEAN
        },
        amenities: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                const value = this.getDataValue('amenities')
                return value ? value.split(',') : []
            }
        },
        pets_allowed: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        smoking_allowed: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        events_allowed: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        surface: {
            type: DataTypes.INTEGER,  
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        extraPersonPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        startingRentingDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endingRentingDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        minimum_nights: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        thumbnail: {
            type: DataTypes.TEXT('long'),
        },
        photos: {
            type: DataTypes.TEXT('long'),
        },
        number_of_reviews: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rating: {
            type: DataTypes.FLOAT(3,2),
            validate: {
                min: 1,
                max: 5
            }
        },
    },
    {   
        freezeTableName: true
    })

    //associations of room model
    room.associate = models => {
        room.hasMany(models.booking, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            allowNull: false,
            noUpdate : true,
        }),
        room.hasMany(models.chat, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            allowNull: false,
            noUpdate : true,
        })
    }

    return room
}