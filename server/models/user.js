const bcrypt = require('bcrypt')
module.exports = (sequelize , DataTypes) => {
    const user = sequelize.define("user", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            unique: {
                args: true,
                msg: JSON.stringify({ error: 902 , msg: "Το όνομα χρήστη χρησιμοποιείται ήδη"})
            },
            allowNull: false,
            validate: {
                len: {
                    args: [8,20],  
                    msg:  JSON.stringify({ error: 903, msg: "Μη έγκυρο όνομα χρήστη" })
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isAlpha: {
                    args: true,
                    msg: JSON.stringify({ error: 904 , msg: "Μη έγκυρα στοιχεία"})
                }
            }
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isAlpha: {
                    args: true,
                    msg: JSON.stringify({ error: 905 , msg: "Μη έγκυρα στοιχεία"})
                }
            }
        },
        fullName: {
            type: DataTypes.VIRTUAL,
            get() {
              return `${this.firstName} ${this.lastName}`
            }
        },
        email: {
            type: DataTypes.STRING,
            unique: {
                args: true,
                msg: JSON.stringify({ error: "906" , msg: "Η διεύθυνση e-mail χρησιμοποιείται ήδη"})
            },
            allowNull: false,
            validate: {
                isEmail: {
                    args: true,
                    msg: JSON.stringify({ error: 907 , msg: "Μη έγκυρη διεύθυνση e-mail"})
                }
            }
        },
        telephone: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        avatar: {
            type: DataTypes.TEXT('long'),
        },
        searchedRoomId: {
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.ENUM,
            values: ['admin', 'host', 'client'],
            allowNull: false,
            validate: {
                isIn: { 
                    args: [['admin', 'host', 'client']] ,
                    msg: JSON.stringify({ error: 908 , msg: "Προέκυψε σφάλμα. Παρακαλώ ξαναπροσπαθήστε"})
                },
                CannotRegisterNewAdmin() {
                    if (this.role  === "admin" && this.username != 'Admin123') {
                        throw new Error(JSON.stringify({ error: 908 , msg: "Προέκυψε σφάλμα. Παρακαλώ ξαναπροσπαθήστε"}))
                    }
                }
            }
        },
        status: {
            type: DataTypes.ENUM,
            values: ['accepted', 'rejected', 'pending'],
            validate: {
                isIn: { 
                    args: [['accepted', 'rejected', 'pending']] ,
                    msg: JSON.stringify({ error: 909 , msg: "Προέκυψε σφάλμα. Παρακαλώ ξαναπροσπαθήστε"})
                }
            },
        }
    }, 
    {   
        freezeTableName: true
    })

    //associations of user model
    user.associate = models => {
        user.hasMany(models.room, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            allowNull: false,
            noUpdate : true,
        })
        user.hasMany(models.booking, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            allowNull: false,
            noUpdate : true,
        }),
        user.hasMany(models.chat, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            allowNull: false,
            noUpdate : true,
        })
        user.hasMany(models.message, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            allowNull: false,
            noUpdate : true,
        })
    }
    //scope for chat record validation
    user.addScope('client', {
        where: {
            role: 'client',
        },
    })

    //Initialize the db with a default admin
    user.sync().then(async () => {
        const existingAdmin = await user.findOne({ where: { username: 'Admin123' } })
        if (!existingAdmin) {
            await user.create({
                username: 'Admin123',
                password: await bcrypt.hash('Admin123!',10),
                firstname: 'testakias',
                lastname: 'tester',
                email: 'testakias@tester.com',
                telephone: 6900112233,
                host_listings_count: 0,
                avatar: '',
                role: 'admin',
                status: 'accepted',
            })
        }
    })

    return user
}