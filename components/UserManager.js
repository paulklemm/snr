class UserManager {
  constructor(userPath) {
    this.userPath = userPath;
  }

  makeNoise() {
    console.log('User Manager on duty.');
  }
};

exports.UserManager = UserManager;