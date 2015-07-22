var zfsGroup = require(__dirname + '/../zfsGroupInfo');
var zfsFilesystemViews = require(__dirname + '/../zfsFilesystemViews');

module.exports = {
    SnapshotServers: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = 'beo';
        zfsGroup(Setup, function(e, Filesystems) {
            if (e) {
                res.code(500);
                throw e;
            }
            return res.json(Filesystems);
        });
    },
};