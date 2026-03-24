const UserRoles = (sequelize, DataTypes) => {
  const UserRole = sequelize.define("user_roles", {
    roleId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "role_id",
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "created_by",
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
  });

  UserRole.associate = (models) => {
    UserRole.hasMany(models.users, {
      foreignKey: "role_id",
      as: "users",
    });
    
    UserRole.hasMany(models.role_permissions, {
      foreignKey: "role_id",
      as: "rolePermissions",
    });
  };

  return UserRole;
};

module.exports = UserRoles;
