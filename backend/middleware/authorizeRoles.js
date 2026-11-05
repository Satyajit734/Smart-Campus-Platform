const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }
        console.log("User role:", req.user.role);
console.log("Allowed roles:", allowedRoles);

        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access forbidden. You don't have permission"
            });
        }

        next();
    };

};

module.exports = authorizeRoles;