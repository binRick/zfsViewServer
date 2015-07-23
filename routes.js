var zfsGroup = require(__dirname + '/../zfsGroupInfo');
var moment = require('moment');
var trim = require('trim');

var _ = require('underscore');

var md5 = require('md5');
var CachemanFile = require('cacheman-file');
var zfsFilesystemViews = require(__dirname + '/../zfsFilesystemViews');

var SnapFilter = function(Snapshot) {
    return String(Snapshot).split('@').length == 2;


};


var Cache = new CachemanFile();

var serverSnapshots = function(Server, CB) {
    var Setup = zfsFilesystemViews.Snapshot.Servers.List;
    Setup.server = Server,
        Setup.bin = 'zfs';
    Setup.ttl = 3600;
    Setup.args = 'list -H -o name -t snap';
    Setup.matches = [];
    Setup.key = md5(Setup.server + Setup.bin + Setup.args);
    Cache.get(Setup.key, function(e, Cached) {
        if (e) throw e;
        if (Cached) {
            console.log('cached hit');
            return CB(Cached.filter(SnapFilter));
        } else {
            console.log('cache miss');
            zfsGroup(Setup, function(e, Snaps) {
                if (e) throw e;
                Setup.cache.set(Setup.key, Snaps, Setup.ttl, function(e) {
                    console.log('cache set');
                    return CB(Snaps.filter(SnapFilter));
                });
            });
        }
    });
};


module.exports = {
    serverPoolSnapshotServers: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = req.params.server;
        Setup.bin = 'zfs';
        if (req.params.fs)
            req.params.fs = req.params.fs.replace(/_/g, '/');
        Setup.args = 'list -H -o name';
        Setup.matches = ['^' + req.params.pool + '/Snapshots/[a-z]*.[a-z]/tank$'];
        Setup.field = 2;
        zfsGroup(Setup, function(e, Filesystems) {
            if (e) {
                res.code(500);
                throw e;
            }
            console.log(Filesystems, typeof Filesystems);
            return res.json(Filesystems);
        });
    },
    serverFilesystemSnapshots: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = req.params.server;
        Setup.bin = 'zfs';
        var fields = req.params.fields;
        req.params.fs = req.params.fs.replace(/_/g, '/');
        Setup.args = 'list -H -o name -t snap';
        Setup.matches = ['^' + req.params.fs + '@'];
        Setup.field = false;
        serverSnapshots(Setup.server, function(Snapshots) {
            Snapshots = Snapshots.filter(function(S) {
                return S.split(req.params.fs).length == 2;
            });
            if (req.params.filter) {
                req.params.filter = req.params.filter.split(',');
                if (_.contains(req.params.filter, 'latest'))
                    Snapshots = [_.last(Snapshots)];
                if (_.contains(req.params.filter, 'ts'))
                    Snapshots = Snapshots.map(function(s) {
                        return trim(_.last(s.split('zfs-auto-snap_daily-')));
                    }).map(function(s) {
                        var m = moment(s, 'YYYY-MM-DD-hhmm');
                        return {
                            str: s,
                            moment: m,
                            ts: m.unix(),

                        }
                    });
            }
            return res.json(Snapshots);
        });
    },
    serverFilesystemInfo: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = req.params.server;
        Setup.bin = 'zfs';
        var fields = req.params.fields;
        req.params.fs = req.params.fs.replace(/_/g, '/');
        Setup.args = 'get -H -p -o value ' + req.params.fields + ' ' + req.params.fs;
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
