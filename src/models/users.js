const bcrypt = require("bcrypt");
const { BCRYPT_SALT_ROUNDS } = require("../config/envConfig");

const Users = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "users",
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        field: "user_id",
      },

      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "role_id",
      },

      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "first_name",
      },

      lastName: {
        type: DataTypes.STRING,
        field: "last_name",
      },

      mobileNumber: {
        type: DataTypes.STRING,
        field: "mobile_number",
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password: {
        type: DataTypes.STRING,
      },

      temporaryPassword: {
        type: DataTypes.STRING,
        field: "temp_password",
      },

      gender: {
        type: DataTypes.STRING,
      },

      rating: {
        type: DataTypes.FLOAT,
      },

      profileUpdated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "profile_updated",
      },

      experience: {
        type: DataTypes.STRING,
      },

      verification: {
        type: DataTypes.STRING,
      },

      emergencyContact: {
        type: DataTypes.STRING,
        field: "emergency_contact",
      },

      isSuperAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_super_admin",
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },

      tokenInvalidDateTime: {
        type: DataTypes.DATE,
        field: "token_invalid_date_time",
      },

      isEmailLinkUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_email_link_used",
      },

      isMailSend: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_mail_send",
      },

      address: {
        type: DataTypes.TEXT,
      },

      state: {
        type: DataTypes.STRING,
      },

      district: {
        type: DataTypes.STRING,
      },

      city: {
        type: DataTypes.STRING,
      },

      bloodGroup: {
        type: DataTypes.STRING,
        field: "blood_group",
      },

      dateOfBirth: {
        type: DataTypes.DATEONLY,
        field: "date_of_birth",
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "created_at",
      },

      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  // Password hashing
  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(parseInt(BCRYPT_SALT_ROUNDS));
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed("password")) {
      const salt = await bcrypt.genSalt(parseInt(BCRYPT_SALT_ROUNDS));
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    User.hasOne(models.user_uniforms, {
      foreignKey: "user_id",
      as: "uniform",
    });
  };

  return User;
};

module.exports = Users;