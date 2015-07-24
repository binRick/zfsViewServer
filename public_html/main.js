var jqg = $.get;
$.get = function(u, CB) {
    var q = {
        url: u,
        start: new Date().getTime(),
    };
    jqg(u, function(a) {
        q.end = new Date().getTime();
        q.dur = q.start - q.end;
        q.bytes = JSON.stringify(a).length;
        q.hdur = humanizeDuration(q.dur);
        delete q.start;
        delete q.end;
        delete q.dur;
        //        console.log(q);
        CB(a);
    });
};
var fileRender = function(s) {
    s = parseInt(s);
    return filesize(s);
};
var g1C = [{
    field: 'recid',
    caption: 'Server',
    style: 'background-color: #C2F5B4; border-bottom: 1px solid white; padding-right: 5px; border: 2px dotted green; font: bold 12px/30px Georgia, serif;',
    size: '3%',
    sortable: true,
    attr: 'align=center'
}, {
    field: 'bytesFree',
    caption: 'Free Space',
    //    style: 'background-color: #efefef; border-bottom: 1px solid white; padding-right: 5px; border: 2px dotted green; font: bold 12px/30px Georgia, serif;',
    size: '1%',
    sortable: true,
    render: function(r) {
        var border = {
            color: 'green',
        };
        //        console.log(r.bytesFree / 1024 / 1024 / 1024);
        if (r.bytesFree < 1024 * 1024 * 1024 * 50)
            border.color = 'yellow';
        if (r.bytesFree < 1024 * 1024 * 1024 * 30)
            border.color = 'red';
        var s = fileRender(r.bytesFree);
        var pre = '<div style="background-color: #efefef; border-bottom: 1px solid white; padding-right: 5px; border: 2px dotted ' + border.color + '; font: bold 12px/30px Georgia, serif;">';
        var po = '</div>';
        s = pre + s + po;
        return s;
    },
}, {
    field: 'Filesystems',
    caption: 'Filesystems',
    size: '1%',
    sortable: true,
    render: function(r) {
        return 100;
    },
}, {
    field: 'Total',
    caption: 'Total',
    size: '1%',
    sortable: true,
    render: function(r) {
        return fileRender(r.bytesFree)
    },
}, {
    field: 'avgLoad',
    caption: 'Avg 1m Load',
    size: '1%',
    sortable: true,
    render: function(r) {
	    r.sar = r.sar||{};
	    r.sar.avgLoad=r.sar.avgLoad||'det';
	    return r.sar.avgLoad;
    },
    //	    return r.sar['AM_4_ldavg-1'];
    /*

            return;
            var BarData = [5, 3, 9, 6, 5, 9, 7, 3, 5, 2, 5, 3, 9, 6, 5, 9, 7, 3, 5, 2, , 5, 9, 7, 3, 5, 2, 5, 3, 9, 6, 5, 9, 7, 6, 5, 9, 7, 3, 5, 2, 5, 3, 9, 6, 5, 9, 7, 3, 5, 2, , 5, 9, 7, 3, 5, 2, 5, 3, 9, 6, 5, , 5, 9, 7, 3, 5, 2, , 5, 9, 7, 3, 5, 2, 5, 3, 9, 6, 5, 9, 7, 6, 5, 9, 7, 3, 5, 2, 5, 3, 9, 6, 5, 9, 7, 3, 5, 2, , 5, 9, 7, 3, 5, 2, 5, 3, 9];
            var n = 'brand_trend_' + '_bar_' + new Date().getTime();
            var BarData = [1, 2, 3, 4, 5, 6, 7];
            var h = '<span id="' + n + '" class="bar">' + BarData.join(',') + '</span>';
            setTimeout(function() {
                var tC = $("#" + n).peity("line", {
                    fill: ["red", "green", "blue"],
                    width: '100%',
                });
                setInterval(function() {
                    var random = Math.round(Math.random() * 10);
                    var values = tC.text().split(",");
                    values.shift();
                    values.push(random);

                    tC.text(values.join(",")).change();
                }, 1000)

            });
            return h;
            return fileRender(r.bytesFree);
    	*/
    //    },
}, {
    field: 'used',
    caption: 'Used Space',
    size: '1%',
    sortable: true,
    render: function(r) {
        return fileRender(r.bytesFree)
    },
}, {
    field: 'Backup',
    caption: 'Backup',
    size: '1%',
    sortable: true,
    render: function(r) {
        return fileRender(r.bytesFree)
    },
}, ];
$(function() {
    $.get('/servers.json', function(ServerJson) {
        $.get('/api/BackupServers', function(BackupServers) {
            var Servers = ServerJson.map(function(ser) {
                return {
                    recid: ser.server,
                    name: ser.server,
                    bytesFree: ser.bytesFree,

                };
            });
            Servers = Servers.slice(0, 20);
            var CG = [{
                caption: 'General Information',
                span: 7,
            }];
            Servers = _.toArray(Servers);
            _.each(BackupServers, function(BackupServer) {
                CG.push({
                    caption: BackupServer.name,
                    span: 12,
                });
                g1C.push({
                    field: BackupServer.name + '_backup_fs',
                    caption: 'Pool',
                    size: '1%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_fs_fs',
                    caption: 'Filesystem',
                    size: '1%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_fs1',
                    caption: 'Used',
                    size: '1%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_fs3',
                    caption: 'Avail',
                    size: '1%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_fs4',
                    caption: 'Schedule',
                    size: '3%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_fs5',
                    caption: 'Day',
                    size: '1%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_fs6',
                    caption: 'x',
                    size: '1%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_fs7',
                    caption: 'y',
                    size: '1%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_snap',
                    caption: 'Snapshots',
                    size: '1%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_aa',
                    caption: 'Average',
                    size: '2%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_os',
                    caption: 'Oldest',
                    size: '2%'
                });
                g1C.push({
                    field: BackupServer.name + '_backup_ns',
                    caption: 'Newest',
                    size: '2%'
                });
                //            console.log(CG);
                //            w2ui['grid1'].columnGroups = CG;
                //            w2ui['grid1'].refresh();
            });
            async.mapSeries(Servers, function(Server, CB) {
                $.get('/api/Server/' + Server.name + '/Sar/-q', function(sarLoad) {
                    var sarLine = sarLoad.map(function(s) {
                        return s['AM_AM_ldavg-1'];
                    }).filter(function(s) {
                        return s;
                    });
                    //	if(sarLoad.length==6)
                    //		sarAvg = sarLoad[2];
                    //if(sarLoad.length==)
                    //	var sarAvg = sarLoad[sarLoad.length-1];
                    var avgLoad = _.last(sarLoad)['ldavg-1'] || _.last(sarLoad)['AM_4_ldavg-1'] || 'unk';
                    var sar = {
                        sarLoad: sarLoad,
                        sarLine: sarLine,
                        Server: Server.name,
			avgLoad: _.last(sarLoad)['ldavg-1'] || _.last(sarLoad)['AM_4_ldavg-1'] || 'unk',
                    };
//                    var u = 
			w2ui['grid1'].get(Server.name).sar = sar;
                    //	record.refresh();
  //                  console.log('sarload', u, w2ui.grid1.records, Server.name);
//		    u.avgLoad = sar.avgLoad;

                    CB(null, sar);
                });
            }, function(e, sarsDone) {
                                console.log('sars done!', sarsDone, w2ui.grid1.records);
w2ui.grid1.refresh();
            });
            $('#grid1').w2grid({
                name: 'grid1',
                multiSelect: true,
                header: 'Servers',
                sortData: [{
                    field: 'bytesFree',
                    direction: 'desc'
                }],
                onReload: function(event) {
                    console.log('reload!', event);
                    w2ui.grid1.clear();

                },
                show: {
                    toolbar: true,
                    header: true,
                    selectColumn: true,
                },
                columnGroups: CG,
                columns: g1C,
                records: Servers,
                onClick: function(event) {
                    $('#grid2').show();
                    $('#grid3').show();
                    var record = this.get(event.recid);
                    this.clear();
                    this.records = [record];
                    this.fixedBody = false;
                    this.refresh();
                    var lock = {
                        spinner: true,
                        opacity: 1
                    };
                    w2ui.grid1.lock('Querying ' + record.recid + ' Pools', lock);
                    w2ui.grid2.lock('Querying ' + record.recid + ' Pools', lock);
                    w2ui.grid3.lock('Querying ' + record.recid + ' Pools', lock);



                    $.get('/api/Server/' + record.recid + '/Pools', function(Pools) {
                        //                        console.log('Backup server pools');
                        var on = 0;
                        w2ui['grid2'].clear();
                        w2ui['grid3'].clear();
                        w2ui['grid2'].header = record.recid + ' Summary';
                        _.each(Pools, function(Pool) {
                            var url = '/api/Server/' + record.recid + '/' + Pool + '/Filesystems';
                            $.get(url, function(Filesystems) {
                                url = '/api/Server/' + record.recid + '/' + Pool + '/VMFilesystems';
                                $.get(url, function(VMFilesystems) {
                                    var recordFilesystems = Filesystems.map(function(fs) {
                                        var fields = ['used', 'available', 'creation', 'compressratio', 'compression', 'atime', 'logicalused', 'logicalreferenced', 'quota'];
                                        var u = '/api/Server/' + record.recid + '/' + fs.replace(/\//g, '_') + '/FilesystemInfo/' + fields.join(',');
                                        var R = {};
                                        R.url = u;
                                        R.recid = fs;
                                        R.fields = fields;
                                        return R;
                                    });
                                    w2ui['grid3'].clear();
                                    var ii = 0;
                                    async.mapSeries(recordFilesystems, function(fs, CB) {
                                        var e = null;
                                        $.get(fs.url, function(I) {
                                            var fsInfo = fs;
                                            _.each(fs.fields, function(field, index) {
                                                fs[field] = I[index];
                                            });
                                            CB(e, fsInfo);
                                        });
                                    }, function(e, fsInfos) {
                                        if (e) throw e;
                                        async.mapSeries(fsInfos, function(fs, CB) {
                                            //                                           console.log('fs', fs);
                                            w2ui['grid3'].add(fs);
                                            CB(null, fs);
                                            /*
                                            var sar = require('./node-sar/lib');
                                            sar(process.argv[2], ['-ubq']).on('stats', function(o){
                                            	      console.log(o);
                                            });*/

                                            _.each(BackupServers, function(BackupServer) {
                                                var ff = BackupServer.name + '_backup_fs';
                                                w2ui.grid1.get(record.recid)[ff] = '<div><input class="enum"> </div>';
                                                ff = BackupServer.name + '_backup_fs1';
                                                w2ui.grid1.get(record.recid)[ff] = 'blah1';
                                                w2ui.grid1.refresh();
                                                //                                                console.log('bs', ff, record);
                                            });
                                            w2ui['grid1'].onClick = function(ev) {
                                                console.log('you clicked!');
                                            };
                                            w2ui['grid1'].onRefresh = function(ev) {
                                                //                                                console.log('g1 rendered');

                                                var pstyle = 'padding-right: 3px; color: #828AA7; text-shadow: 1px 1px 3px white;';
                                                var people = ['George Washington', 'John Adams', 'Thomas Jefferson', 'James Buchanan', 'James Madison', 'Abraham Lincoln', 'James Monroe', 'Andrew Johnson', 'John Adams', 'Ulysses Grant', 'Andrew Jackson', 'Rutherford Hayes', 'Martin VanBuren', 'James Garfield', 'William Harrison', 'Chester Arthur', 'John Tyler', 'Grover Cleveland', 'James Polk', 'Benjamin Harrison', 'Zachary Taylor', 'Grover Cleveland', 'Millard Fillmore', 'William McKinley', 'Franklin Pierce', 'Theodore Roosevelt', 'John Kennedy', 'William Howard', 'Lyndon Johnson', 'Woodrow Wilson', 'Richard Nixon', 'Warren Harding', 'Gerald Ford', 'Calvin Coolidge', 'James Carter', 'Herbert Hoover', 'Ronald Reagan', 'Franklin Roosevelt', 'George Bush', 'Harry Truman', 'William Clinton', 'Dwight Eisenhower', 'George W. Bush', 'Barack Obama'];
                                                $('.enum').w2field('enum', {
                                                    items: people,
                                                    openOnFocus: true,
                                                    selected: [{
                                                        id: 0,
                                                        text: 'John Adams'
                                                    }, {
                                                        id: 0,
                                                        text: 'Thomas Jefferson'
                                                    }]
                                                });


                                            };



                                        }, function(e, adds) {
                                            var h = parseInt($('#grid1').css('height').replace(/px/g, '')) + parseInt($('.backupDiv').first().css('height').replace(/px/g, ''));
                                            //                                            console.log('h is', h);
                                            $('#grid2').css('top', h);
                                            $('#grid3').css('top', h);
                                            w2ui.grid3.unlock();
                                            w2ui.grid2.unlock();
                                            w2ui.grid1.unlock();
                                        });
                                    });
                                });
                            });
                        });
                    });
                    var left = 0;
                    $('.backupDiv').remove();
                    _.each(BackupServers, function(BackupServer) {
                        var id = 'grid_backup_' + BackupServer.name + '_' + record.recid;
                        var qq = '/api/Server/' + BackupServer.name + '/' + BackupServer.pool + '/SnapshotServers';
                        $.get(qq, function(SnapshotServers) {
                            var topH = $('#grid1').css('height'); //'300px';
                            leftD = left + 'px';
                            left = left + 500 + 5;
                            var width = '500px';
                            var height = '300px';
                            var html = '<div class="backupDiv" id="' + id + '" style="position: absolute; top: ' + topH + '; left: ' + leftD + '; width: ' + width + '; height: ' + height + ';"></div>';
                            var contains = _.contains(SnapshotServers, record.recid);
                            //                            console.log(BackupServer, id, qq, SnapshotServers, record.recid, contains, record);

                            var FS = 'tank/Snapshots/' + record.recid;
                            var fields = ['used', 'available', 'creation', 'compressratio', 'compression', 'atime', 'logicalused', 'logicalreferenced', 'quota'];
                            var lUrl = '/api/Server/' + BackupServer.name + '/' + BackupServer.pool + '_Snapshots_' + record.recid + '/FilesystemInfo/' + fields.join(',');
                            $.get(lUrl, function(BackupServerStorage) {
                                //                                console.log('lurl', lUrl, BackupServerStorage);
                                var Cols = [{
                                    field: 'recid',
                                    caption: 'Name',
                                    size: '100px',
                                    style: 'background-color: #efefef; border-bottom: 1px solid white; padding-right: 5px;',
                                    attr: "align=right"
                                }, {
                                    field: 'value',
                                    caption: 'Value',
                                    size: '100%',
                                    render: function(rec) {
                                        if (!isNaN(rec.value))
                                            if (rec.value > 1000)
                                                return filesize(parseInt(rec.value));
                                        return rec.value;

                                    },
                                }];
                                var Recs = fields.map(function(f, index) {
                                    return {
                                        recid: f,
                                        value: BackupServerStorage[index],
                                    };
                                });
                                $('#grid1').after(html);
                                if (w2ui[id]) w2ui[id].destroy();
                                $('#' + id).w2grid({
                                    header: record.recid + ' => ' + BackupServer.name + ' Backups',
                                    show: {
                                        header: true,
                                        columnHeaders: true,
                                    },
                                    name: id,
                                    columns: Cols,
                                    records: Recs,
                                });
                            });
                        });
                    });
                }
            });

            $('#grid2').w2grid({
                header: 'Summary',
                show: {
                    header: true,
                    columnHeaders: false
                },
                name: 'grid2',
                columns: [{
                    field: 'name',
                    caption: 'Name',
                    size: '100px',
                    style: 'background-color: #efefef; border-bottom: 1px solid white; padding-right: 5px;     border: 1px solid silver;',
                    attr: "align=right"
                }, {
                    field: 'value',
                    caption: 'Value',
                    size: '100%'
                }]
            });
            $('#grid3').w2grid({
                header: 'Filesystems',
                show: {
                    header: true,
                    columnHeaders: true
                },
                name: 'grid3',
                columns: [{
                    field: 'recid',
                    caption: 'Filesystem',
                    size: '100px',
                    style: 'background-color: #efefef; border-bottom: 1px solid white; padding-right: 5px;',
                    sortable: true,
                    attr: "align=right"
                }, {
                    field: 'quota',
                    caption: 'Quota',
                    sortable: true,
                    size: '100%'
                }, {
                    field: 'used',
                    sortable: true,
                    caption: 'Used',
                    size: '100%'
                }, {
                    field: 'available',
                    caption: 'Avail',
                    size: '100%',
                    sortable: true,
                }, {
                    field: 'creation',
                    caption: 'Creation',
                    size: '100%',
                    sortable: true,
                }, {
                    field: 'atime',
                    caption: 'Atime',
                    size: '100%',
                    sortable: true,
                }, {
                    field: 'logicalused',
                    caption: 'Log. Used',
                    size: '100%',
                    sortable: true,
                }, {
                    field: 'compression',
                    caption: 'Comp.',
                    size: '100%',
                    sortable: true,
                }, {
                    field: 'compressratio',
                    caption: 'C. Ratio',
                    size: '100%',
                    sortable: true,
                }, {
                    field: 'vm',
                    caption: 'Virtual Machine',
                    size: '100%',
                    sortable: true,
                }, ]
            });
        });
    });
});
