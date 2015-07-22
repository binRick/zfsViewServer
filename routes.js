module.exports = {
    servers: {
        findAll: function(req, res) {
            var Response = [{
                asd: 123
            }];
            return res.json(Response);
        },
    },
};
