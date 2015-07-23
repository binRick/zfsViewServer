var zfsGroup = require(__dirname + '/../zfsGroupInfo');
var zfsFilesystemViews = require(__dirname + '/../zfsFilesystemViews');

module.exports = {
    serverFilesystemSnapshots: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = req.params.server;
        Setup.bin = 'zfs';
	var fields = req.params.fields;
	req.params.fs = req.params.fs.replace(/_/g,'/');
        Setup.args = 'list -H -o name -t snap';
        Setup.matches = ['^'+req.params.fs+'@'];
        Setup.field = false;
        zfsGroup(Setup, function(e, Filesystems) {
            if (e) {
                res.code(500);
                throw e;
            }
            console.log(Filesystems, typeof Filesystems);
            return res.json(Filesystems);
        });
    },
    serverFilesystemInfo: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = req.params.server;
        Setup.bin = 'zfs';
	var fields = req.params.fields;
	req.params.fs = req.params.fs.replace(/_/g,'/');
        Setup.args = 'get -H -p -o value '+req.params.fields+' '+req.params.fs;
        Setup.matches = [''];
        Setup.field = false;
        zfsGroup(Setup, function(e, Filesystems) {
            if (e) {
                res.code(500);
                throw e;
            }
            console.log(Filesystems, typeof Filesystems);
            return res.json(Filesystems);
        });
    },
    serverPoolFilesystems: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = req.params.server;
        Setup.bin = 'zfs';
        Setup.args = 'list -H -o name';
        Setup.matches = ['^' + req.params.pool + '/'];
        Setup.field = false;
        zfsGroup(Setup, function(e, Filesystems) {
            if (e) {
                res.code(500);
                throw e;
            }
            console.log(Filesystems, typeof Filesystems);
            return res.json(Filesystems);
        });
    },
    serverPools: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = req.params.server;
        Setup.bin = 'zpool';
        Setup.args = 'list -H -o name';
        Setup.matches = ['^[a-z]*.[a-z]$'];
        Setup.field = false;
        zfsGroup(Setup, function(e, Filesystems) {
            if (e) {
                res.code(500);
                throw e;
            }
            console.log(Filesystems, typeof Filesystems);
            return res.json(Filesystems);
        });
    },
    SnapshotServers: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = 'beo';
        Setup.bin = 'zfs';
        Setup.args = 'list -H -o name';
        Setup.matches = ['^tank/Snapshots/[a-z]*.[a-z]$'];
        zfsGroup(Setup, function(e, Filesystems) {
            if (e) {
                res.code(500);
                throw e;
            }
            return res.json(Filesystems);
        });
    },
};
