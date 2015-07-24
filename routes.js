var zfsGroup = require(__dirname + '/../zfsGroupInfo'),

    c = require('chalk');
var sar = require(__dirname + '/../node-sar/lib');
var moment = require('moment'),
    config = require('./config');
var trim = require('trim');

var _ = require('underscore');

var md5 = require('md5');
var CachemanFile = require('cacheman-file');
var zfsFilesystemViews = require(__dirname + '/../zfsFilesystemViews');

var SnapFilter = function(Snapshot) {
    return String(Snapshot).split('@').length == 2;


};


var Cache = new CachemanFile();

var listServers = function(Filter, CB) {
    var Setup = zfsFilesystemViews.Snapshot.Servers.List;
    Setup.server = 'beo',
        Setup.bin = '/bin/Z.sh';
    Setup.ttl = 3600 * 4;
    Setup.args = '     ';
    Setup.matches = [];
    Setup.key = md5(Setup.server + Setup.bin + Setup.args);
    Cache.get(Setup.key, function(e, Cached) {
        if (e) throw e;
        if (Cached && Cached.length > 1) {
            console.log(c.green.bgWhite('cache hit for servers with', Cached.length, 'records'));
            return CB(Cached);
            return CB(Cached.filter(Filter));
        }
        zfsGroup(Setup, function(e, Servers) {
            //            Servers = JSON.parse(Servers);
            if (Servers) {
                console.log(c.green.bgWhite('cache hit for servers with', Servers.length, 'records'));
                Setup.cache.set(Setup.key, Servers, Setup.ttl, function(e) {
                    console.log(c.green.bgWhite('servers cache set to', Servers.length, 'records'));
                });
            } else
                Servers = [];
            return CB(Servers);
            return CB(Servers.filter(Filter));

        });

    });

};


var serverSnapshots = function(Server, CB) {
    var Setup = zfsFilesystemViews.Snapshot.Servers.List;
    Setup.server = Server,
        Setup.bin = 'zfs';
    Setup.ttl = 3600;
    Setup.args = 'list -H -o name -t snap -s used';
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
    BackupServers: function(req, res) {
        return res.json(config.BackupServers);
    },
    ListServers: function(req, res) {
        var Filter = function(server) {
            return true;
        };
        listServers(Filter, function(Servers) {
            var Response = Servers;
            return res.json(Response);
        });
    },
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
    serverSarReport: function(req, res) {
        var params = req.params.params || '-u';
        var server = req.params.server;
var key = md5(params + server);
    Cache.get(key, function(e, Cached) {
if(e)throw e;
if(!Cached||Cached.length<1){
        sar(server, [params]).on('stats', function(o) {
	                    Cache.set(key, o, 60*60 * 6, function(e) {
				    if(e)throw e;
		try{
	    res.send(o);

		}catch(e){
console.log(c.red.bgWhite(e));
		}
			    });

        });
}else{
console.log(c.green.bgWhite('cache hit! for ', server, params));
res.send(Cached);
}
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
                        return s.split('-').slice(-4);
                    }).map(function(s) {
                        var m = moment(s, 'YYYY-MM-DD-hhmm');
                        return {
                            //                            str: s,
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
        Setup.ttl = 3600 * 6;
        zfsGroup(Setup, function(e, Filesystems) {
            if (e) {
                res.code(500);
                throw e;
            }
            console.log(Filesystems, typeof Filesystems);
            return res.json(Filesystems);
        });
    },
    serverPoolVMFilesystems: function(req, res) {
        var Setup = zfsFilesystemViews.Snapshot.Servers.List;
        Setup.server = req.params.server;
        Setup.bin = 'zfs';
        Setup.args = 'list -H -o name';
        Setup.matches = ['^' + req.params.pool + '/[0-9]*.[0-9]$'];
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
