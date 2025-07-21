module.exports = (sequelize , DataTypes) => {
    const message = sequelize.define("message", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
            noUpdate : true
        }
    },
    {   
        freezeTableName: true,
        updatedAt: false,   //no need for updatedAt timestamp, values are unchangeable
    })

    return message
}