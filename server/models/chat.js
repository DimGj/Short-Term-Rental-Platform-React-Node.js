module.exports = (sequelize , DataTypes) => {
    const chat = sequelize.define("chat", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        }
        /*roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            noUpdate : true,
            references: {
                model: 'room',
                key: 'id',

            },
            validate: {
                async validRoom() {
                  const room = await sequelize.models.room.findOne({
                    where: {
                      id: this.roomId,
                    },
                  })
                  if (!room) {
                    throw new Error({ error: "923", msg: "Room does not exist"})
                  }
                },
              },
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            noUpdate : true,
            references: {
                model: 'user',
                key: 'id'
            },
            validate: { //ensure that clientId belongs to a client User
                async validClientId() {
                    const clientUser = await sequelize.models.user.scope('client').findOne({
                        where: {
                            id: this.clientId,
                        },
                    })
                    if (!clientUser)
                        throw new Error({ error: "924", msg: "The provided id does not belong to a client user"})
                }
            }
            
        },*/
    },
    {   
        freezeTableName: true,
        updatedAt: false,   //no need for updatedAt timestamp, values are unchangeable
        uniqueKeys: {
            // Define a unique constraint on roomId and clientId
            uniqueChat: {
                fields: ['roomId', 'userId']  //the combination of those foreign keys must be unique becuase thats what a chat is defined
            }
        }
    })

    //associations of chat model
    chat.associate = models => {
        chat.hasMany(models.message, {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            allowNull: false,
            noUpdate : true,
        })
    }

    return chat
}