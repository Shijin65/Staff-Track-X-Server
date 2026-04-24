"use strict";

const UserAttachments = (sequelize, DataTypes) => {
  const UserAttachment = sequelize.define(
    "user_attachments",
    {
      attachmentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        field: "attachment_id",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      picId: {
        type: DataTypes.UUID,
        field: "pic_id",
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "file_name",
      },
      contentType: {
        type: DataTypes.STRING,
        field: "content_type",
      },
      fileExtension: {
        type: DataTypes.STRING,
        field: "file_extension",
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
      tableName: "user_attachments",
      timestamps: true,
    }
  );

  UserAttachment.associate = (models) => {
    UserAttachment.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return UserAttachment;
};

module.exports = UserAttachments;
