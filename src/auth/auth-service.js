const AuthService = {
    getUserWithUserName(db, user_name) {
        return db('thingful_users')
            .select('*')
            .where({user_name})
            .first()
    },


}

module.exports = AuthService;