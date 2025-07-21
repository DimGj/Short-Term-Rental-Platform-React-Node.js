module.exports = (sequelize , DataTypes) => {
    const booking = sequelize.define("booking", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        checkInDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        checkOutDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        numberOfPeople: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        totalPrice: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        review: {
            type: DataTypes.STRING,
        },
        rating: {
            type: DataTypes.INTEGER,
            validate: {
                min: 1,
                max: 5
            }
        },
    },
    {   
        freezeTableName: true
    })

    return booking
}