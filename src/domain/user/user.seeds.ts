const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../../middleware");
const db = require("../../models");
const { ApiResponse } = require("../../utils");
const welcomeEmail = require("../../templates/email_templates/welcomeMail");
const {
  PASSWORD_SETUP_LINK_EXPIRY,
  PASSWORD_SETUP_SECRET_KEY,
} = require("../../config/envConfig");
const resetPasswordEmail = require("../../templates/email_templates/resetPasswordMail");

const User = db.users;
const UserRoles = db.user_roles;
const RolePermission = db.role_permissions;
const PermissionName = db.api_names;
const AssignedUserRoles = db.assigned_user_roles;
const Production = db.productions;
const ProductionAccesses = db.production_accesses;
class UserController {
  // GET ALL USER              ////////////////////////////////////////

  static getAll = asyncHandler(async (req, res) => {
    const {
      SortBy = "updatedAt",
      SortByAscending = "false",
      Page = 1,
      Limit = 10,
      SearchQuery = "",
      IsActive,
    } = req.query;

    const page = parseInt(Page);
    const limit = parseInt(Limit);
    const offset = (page - 1) * limit;
    const sortDirection = SortByAscending === "true" ? "ASC" : "DESC";


    // Base WHERE
    const whereClause: any = {
      // userId: { [Op.ne]: SUPER_ADMIN_UID },
    };

    // Search
    if (SearchQuery) {
      const search = `%${SearchQuery.toLowerCase()}%`;
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: search } },
        { lastName: { [Op.iLike]: search } },
        { email: { [Op.iLike]: search } },
      ];
    }

    // Active filter
    if (IsActive === "true" || IsActive === "false") {
      whereClause.isActive = IsActive === "true";
    }

    // Sorting
    let order: any = [[SortBy, sortDirection]];
    if (SortBy === "fullName") {
      order = [
        ["firstName", sortDirection],
        ["lastName", sortDirection],
      ];
    }

    // Query
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order,
    });

    // Format response
    const data = rows.map((user) => ({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      isSuperAdmin: user.isSuperAdmin,
      updatedAt: user.updatedAt,
    }));

    return res.json(
      new ApiResponse(200, "Success", data, {
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        itemCount: data.length,
      })
    );
  });

  // GET USER BY ID   ////////////////////////////////////////
  static getById = asyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({
        where: { userId: id },
        include: [
          {
            model: AssignedUserRoles,
            as: "assignedUserRoles",
            attributes: ["role_id"],
          },
          {
            model: ProductionAccesses,
            as: "productionAccesses",
            attributes: ["prod_id"],
          },
        ],
      });

      if (!user) {
        res.status(404).json(new ApiResponse(404, "User not found."));
      }
      const productions =
        user
          .get({ plain: true })
          .productionAccesses?.map(
            (ProductionAccess) => ProductionAccess.prod_id
          ) || [];
      const roles =
        user
          .get({ plain: true })
          .assignedUserRoles?.map((assignedRole) => assignedRole.role_id) || [];

      const response = {
        email: user.email,
        userId: id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
        roles: roles,
        productions,
      };
      return res.json(new ApiResponse(200, "Success.", response));
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to get User."));
    }
  });

  //// GET USER PERMISSION BY ID            ////////////////////////////////////////
  static getPermissionById = asyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({
        where: { userId: id },
        include: [
          {
            model: AssignedUserRoles,
            as: "assignedUserRoles",
            attributes: ["role_id"],
            include: [
              {
                model: UserRoles,
                as: "roles",
                attributes: ["roleId", "title"],
                raw: true,
              },
            ],
          },
          {
            model: ProductionAccesses,
            as: "productionAccesses",
            attributes: ["prod_id"],
            include: [
              {
                model: Production,
                as: "production",
                attributes: ["prodId", "productionName"],
                raw: true,
              },
            ],
          },
        ],
      });

      if (!user) {
        res.status(404).json(new ApiResponse(404, "User not found."));
      }

      const productions =
        user
          .get({ plain: true })
          .productionAccesses?.map(
            (ProductionAccess) => ProductionAccess.production
          ) || [];

      const roles =
        user
          .get({ plain: true })
          .assignedUserRoles?.map((assignedRole) => assignedRole.roles) || [];

      const apiPermissionData = await PermissionName.findAll({
        raw: true,
        attributes: ["name", "category", "apiId"],
      });

      const roleIds = roles.map((role) => role.roleId);
      const userRolePermission = await RolePermission.findAll({
        where: { role_id: { [Op.in]: roleIds } },
        attributes: ["apiId"],
        raw: true,
      }).then((permissions) => permissions.map(({ apiId }) => apiId));

      const updatedApis = apiPermissionData.map((api) => ({
        ...api,
        is_access: userRolePermission.includes(api.apiId),
      }));

      const response = {
        userId: id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
        roles,
        permissions: updatedApis,
        productions,
      };
      return res.json(new ApiResponse(200, "Success.", response));
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to get User."));
    }
  });

  // CREATE USER               ////////////////////////////////////////
  static create = asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      phone,
      email,
      isActive,
      roleIds,
      gender,
      productionIds,
    } = req.body;
    try {
      const newUserDetails = await User.create({
        firstName,
        lastName,
        phone,
        email,
        isActive,
        gender,
      });
      const newUser = newUserDetails.get({ plain: true });

      if (newUser) {
        const assignedRoles = roleIds.map((id) => ({
          roleId: id,
          userId: newUser.userId,
        }));

        const accessProductions = productionIds.map((id) => ({
          userId: newUser.userId,
          productionId: id,
        }));

        await Promise.all([
          AssignedUserRoles.bulkCreate(assignedRoles, {
            returning: true,
          }),
          ProductionAccesses.bulkCreate(accessProductions, {
            returning: true,
          }),
        ]);

        if (newUser.isActive) {
          const jwtToken = await jwt.sign(
            { userId: newUser.userId, linkType: "join" },
            PASSWORD_SETUP_SECRET_KEY,
            {
              expiresIn: PASSWORD_SETUP_LINK_EXPIRY,
            }
          );
          await welcomeEmail(newUser, jwtToken);
          newUserDetails.isMailSend = true;
          await newUserDetails.save();
        }
      }
      res
        .status(201)
        .json(new ApiResponse(201, "User created successfully.", req.body));
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json(new ApiResponse(400, "Failed to create User."));
    }
  });

  // UPDATE USER                ////////////////////////////////////////
  static updateUser = asyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const {
        firstName,
        lastName,
        phone,
        isActive,
        gender,
        rolesToRemove,
        rolesToAdd,
        productionsToAdd,
        productionsToRemove,
      } = req.body;
      const user = await User.findByPk(id);
      if (user) {
        if (rolesToRemove.length > 0) {
          await AssignedUserRoles.destroy({
            where: {
              userId: id,
              roleId: rolesToRemove,
            },
          });
        }

        const assignedRoles = rolesToAdd.map((roleId) => ({
          userId: id,
          roleId,
        }));

        if (rolesToAdd.length > 0) {
          await AssignedUserRoles.bulkCreate(assignedRoles, {
            returning: true,
          });
        }

        if (productionsToRemove.length > 0) {
          await ProductionAccesses.destroy({
            where: {
              userId: id,
              productionId: productionsToRemove,
            },
          });
        }
        const newProductions = productionsToAdd.map((production) => ({
          userId: id,
          productionId: production,
        }));

        if (productionsToAdd.length > 0) {
          await ProductionAccesses.bulkCreate(newProductions, {
            returning: true,
          });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        user.isActive = isActive;
        user.gender = gender;
        user.updatedAt = Date.now();
        user.tokenInvalidDateTime = new Date();
        const updatedUser = await user.save();

        if (!user?.isMailSend && isActive) {
          const jwtToken = await jwt.sign(
            { userId: updatedUser.dataValues.userId, linkType: "join" },
            PASSWORD_SETUP_SECRET_KEY,
            {
              expiresIn: PASSWORD_SETUP_LINK_EXPIRY,
            }
          );
          await welcomeEmail(updatedUser.dataValues, jwtToken);
          updatedUser.isMailSend = true;
          await updatedUser.save();
        }
        res.json(
          new ApiResponse(
            200,
            "The User has been updated successfully.",
            updatedUser
          )
        );
      } else {
        res.status(400).json(new ApiResponse(400, "User not found."));
      }
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to update User."));
    }
  });

  // DELETE USER                ////////////////////////////////////////
  static deleteOne = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const loginUser = req.user.userId;

      const user = await User.findByPk(id);

      if (user) {
        if (user.userId === loginUser) {
          return res
            .status(400)
            .json(
              new ApiResponse(
                400,
                "You cannot delete your own account. Please contact the administrator."
              )
            );
        }
        await User.destroy({
          where: {
            userId: id,
          },
        });
        return res.json(new ApiResponse(200, "User Removed."));
      } else {
        return res.status(404).json(new ApiResponse(404, "User not found."));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json(new ApiResponse(400, "Failed to delete User."));
    }
  });

  // MULTIPLE DELETE USER       ////////////////////////////////////////
  static deleteMany = asyncHandler(async (req, res) => {
    try {
      const { ids } = req.body;
      const loginUser = req.user.userId;

      const users = await User.findAll({
        where: {
          userId: { [Op.in]: ids },
        },
        raw: true,
      });

      if (!users || users.length === 0) {
        return res.status(404).json(new ApiResponse(404, "User(s) Not Found."));
      }
      if (loginUser && users.some((user) => user.userId === loginUser)) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              "You cannot delete your own account. Please contact the administrator."
            )
          );
      }
      await User.destroy({
        where: {
          userId: { [Op.in]: ids },
        },
      });
      return res.json(new ApiResponse(200, "User(s) Removed."));
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to delete User(s)."));
    }
  });

  //GET USER PROFILE DATA                 ////////////////////////////////////////
  static getProfile = asyncHandler(async (req, res) => {
    try {
      const id = req.user.userId;

      const user = await User.findOne({
        where: { userId: id },
      });

      if (!user) {
        res.status(404).json(new ApiResponse(404, "User not found."));
      }

      const response = {
        userId: id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
      };

      return res.json(new ApiResponse(200, "Success.", response));
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to get User."));
    }
  });

  // UPDATE USER PROFILE                ////////////////////////////////////////
  static updateUserProfile = asyncHandler(async (req, res) => {
    try {
      const id = req.user.userId;
      const { firstName, lastName, phone, gender } = req.body;

      const user = await User.findByPk(id);
      if (user) {
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        user.gender = gender;
        user.tokenInvalidDateTime = new Date();

        const updatedUser = await user.save();

        res.json(
          new ApiResponse(
            200,
            "The User has been updated successfully.",
            updatedUser
          )
        );
      } else {
        res.status(400).json(new ApiResponse(400, "User not found."));
      }
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to update User."));
    }
  });

  // SET NEW PASSWORD           ////////////////////////////////////////
  static setNewPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    try {
      const decoded = jwt.verify(id, PASSWORD_SETUP_SECRET_KEY);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user && user.password && (await user.verifyPassword(password))) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              "New password cannot be the same as the old password."
            )
          );
      }
      user.password = password;
      user.isEmailLinkUsed = true;
      user.temporaryPassword = null;
      await user.save();
      res
        .status(200)
        .json(new ApiResponse(200, "Password updated successfully."));
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res
          .status(410)
          .json(
            new ApiResponse(
              410,
              "This link has expired. Please contact the administrator to resend it."
            )
          );
      }
      console.error(error);
      res.status(400).json(new ApiResponse(400, "Failed to set password."));
    }
    return;
  });

  // RESET PASSWORD TRIGGER // RESET PASSWORD MAIL SENDER ////////////////////////////////////////
  static resetPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User Not Found."));
      }

      user.temporaryPassword = password;
      await user.save();

      const jwtToken = await jwt.sign(
        { userId: user.userId, linkType: "passwordReset" },
        PASSWORD_SETUP_SECRET_KEY,
        {
          expiresIn: PASSWORD_SETUP_LINK_EXPIRY,
        }
      );

      // Send reset password email
      await resetPasswordEmail(user.dataValues, password, jwtToken);

      res.json(new ApiResponse(200, "Password Reset Successful."));
    } catch (error) {
      console.error("Error during password reset:", error);
      res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "An error occurred while processing your password reset request."
          )
        );
    }
  });

  // FORGET PASSWORD TRIGGER // FORGET PASSWORD MAIL SENDER ////////////////////////////////////////
  static forgetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User Not Found."));
      }

      user.temporaryPassword = password;
      await user.save();

      const jwtToken = await jwt.sign(
        { userId: user.userId, linkType: "passwordReset" },
        PASSWORD_SETUP_SECRET_KEY,
        {
          expiresIn: PASSWORD_SETUP_LINK_EXPIRY,
        }
      );

      // Send reset password email
      await resetPasswordEmail(user.dataValues, password, jwtToken);

      res.json(new ApiResponse(200, "Password Reset Successful."));
    } catch (error) {
      console.error("Error during password reset:", error);
      res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "An error occurred while processing your forget password request."
          )
        );
    }
  });

  // CHANGE PASSWORD TRIGGER    ////////////////////////////////////////
  static changePassword = asyncHandler(async (req, res) => {
    const id = req.user.userId;
    const { newPassword } = req.body;
    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User Not Found."));
      }

      if (user && (await user.verifyPassword(newPassword))) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              "New password cannot be the same as the old password."
            )
          );
      }
      user.password = newPassword;
      user.temporaryPassword = null;
      await user.save();

      res.json(new ApiResponse(200, "Password Reset Successful."));
    } catch (error) {
      console.error("Error during password reset:", error);
      res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "An error occurred while processing your change password request."
          )
        );
    }
  });

  // CHECK TEMPORARY PASSWORD   ////////////////////////////////////////
  static checkSecretKey = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;

    try {
      const decoded = jwt.verify(id, PASSWORD_SETUP_SECRET_KEY);
      const user = await User.findOne({ where: { email }, raw: true });

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found."));
      }

      if (decoded.userId !== user.userId) {
        return res
          .status(400)
          .json(new ApiResponse(400, "Invalid credentials."));
      }

      if (user.temporaryPassword === password) {
        res.status(202).json(
          new ApiResponse(202, "Temporary password matched successfully.", {
            redirect: true,
          })
        );
      } else {
        res.status(400).json(new ApiResponse(400, "Invalid credentials."));
      }
    } catch (error) {
      res.status(400).json(new ApiResponse(400, "Failed to compare password."));
    }
  });

  // CHECK EMAIL                ////////////////////////////////////////
  static checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      res.json(new ApiResponse(200, "Email Already Exists."));
    } else {
      res.status(204).json(new ApiResponse(204, "Email Not Exists."));
    }
  });

  // CHECK CURRENT PASSWORD                ////////////////////////////////////////
  static checkCurrentPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const id = req.user.userId;

    const user = await User.findByPk(id);

    if (user && (await user.verifyPassword(password))) {
      res.json(new ApiResponse(200, "Password matched."));
    } else {
      res.status(204).json(new ApiResponse(204, "Password not matched."));
    }
  });
}

export default UserController;
