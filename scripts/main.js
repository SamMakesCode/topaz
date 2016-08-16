// This is what a default connection should look like
default_tab = {
    "name": "Unnamed Connection",
    "ip": null,
    "port": null,
    "lines": [
    ],
    "websocket": null
};

// This where all the user data is stored
data = {
    "active_tab": 0,
    "tabs": [
    ]
};

$(document).ready(function() {
    loadTabs();
    $(document).on('click', '.tab', function() {
        var id = $(this).attr('id');
        if (id == 'new_tab') {
            var new_tab = jQuery.extend(true, {}, default_tab);
            data.tabs.push(new_tab); // Create a new tab
            loadTabs(); // Reload all tabs
            setActiveTab(data.tabs.length - 1); // Set active tab to new one
        } else {
            setActiveTab(id);
        }
    });
    $(document).on('click', '#new_connection', function() {
        var tab = data.tabs[data.active_tab];
        var ip = $('#ip').val();
        tab.ip = ip;
        var port = $('#port').val();
        tab.port = port;
        var name = $('#name').val();
        if (name != '') {
            tab.name = name;
        }
        data.tabs[data.active_tab].websocket = new WebSocket('ws://' + tab.ip + ':' + tab.port);
        data.tabs[data.active_tab].websocket.onopen = function() {
            websocketOpen();
        };
        data.tabs[data.active_tab].websocket.onclose = function() {
            websocketClose();
        };
        data.tabs[data.active_tab].websocket.onmessage = function(evt) {
            websocketMessage(evt);
        };
        loadTabs();
        setActiveTab(data.active_tab);
    });
    $('#main_input').keypress(function(e) {
        switch (e.keyCode) {
            case 13:
                var main_input = $('#main_input');
                var input = main_input.val();
                main_input.val('');
                var tab = data.tabs[data.active_tab];
                if (data.tabs[data.active_tab].websocket != null && (data.tabs[data.active_tab].websocket.readyState == 1 || data.tabs[data.active_tab].websocket.readyState == 0)) {
                    tab.websocket.send(input);
                    tab.lines.push('<span class="blue">Sent: ' + input + '</span>');
                    reloadLines(data.active_tab);
                    var main = $('main');
                    var height = main[0].scrollHeight;
                    main.scrollTop(height);
                }
                break;
        }
    });
    $(document).on('click', '.close_tab', function(e) {
        // Get tab id
        var tab_id = parseInt($(this).parent().attr('id'));
        // If tab is connected, send disconnect signal
        if (data.tabs[tab_id].websocket != null && (data.tabs[tab_id].websocket.readyState == 1 || data.tabs[tab_id].websocket.readyState == 0)) {
            data.tabs[tab_id].websocket.close();
        }
        data.tabs.splice(tab_id,1);
        // Reload tabs
        $('main').html('');
        loadTabs();
        e.stopPropagation();
    });
});

function loadTabs()
{
    var tab_container = $('#tabs');
    tab_container.html(''); // Get rid of all tabs
    var html = '<div class="tab_wrap">';
    if (data.tabs.length > 0) {
        for (var i = 0; i < data.tabs.length; i++) { // For all the tabs
            // Create the tabs!
            html = html + '<div id="' + i + '" class="tab">' + data.tabs[i].name + ' <a class="close_tab"><i class="fa fa-times"></i></a></div>';
            setActiveTab(data.active_tab);
        }
    }
    html = html + '<div id="new_tab" class="tab"><i class="fa fa-plus"></i> New Connection</div>';
    html = html + '</div>';
    tab_container.append(html);
}

function setActiveTab(tab_id)
{
    data.active_tab = tab_id;

    // Make no tab as active
    $('.tab').each(function() {
        $(this).removeClass('active');
    });

    // Get the clicked tab
    var tab_link = $('#' + tab_id);
    // Show the tab as active
    tab_link.addClass('active');

    // Get the main section
    var main = $('main');
    // Dump it's content
    main.html('');
    var tab = data.tabs[tab_id];

    // Insert all the lines
    reloadLines(tab_id);

    if (tab !== undefined) {
        if (tab.ip === null) {
            var html = '<div class="veil"></div>';
            html = html + '<div class="popup">' +
                '<div class="form_row"><label for="ip">IP Address</label><input type="text" id="ip" name="ip" value="echo.websocket.org"></div>' +
                '<div class="form_row"><label for="port">Port</label><input type="text" id="port" name="port" value="80"></div>' +
                '<div class="form_row"><label for="name">Name</label><input type="text" id="name" name="name" placeholder="optional"></div>' +
                '<div class="form_row center"><button id="new_connection">Connect</button></div>' +
                '</div>';
            main.append(html);
        }
    }
}

function reloadLines(tab_id)
{
    var main = $('main');
    main.html('');
    var tab = data.tabs[tab_id];
    if (tab !== undefined) {
        if (tab.lines !== undefined && tab.lines.length >= 1) {
            for (var i = 0; i < tab.lines.length; i++) {
                var html = '<div class="line">' + tab.lines[i] + '</div>';
                main.append(html);
            }
        }
    }
}

function websocketOpen()
{
    var tab = data.tabs[data.active_tab];
    tab.lines.push('<span class="green">Successfully connected to ' + tab.ip + ':' + tab.port + '</span>');
    reloadLines(data.active_tab);
}

function websocketClose()
{
    //var tab = data.tabs[data.active_tab];
    //tab.lines.push('<span class="red">Connection with ' + tab.ip + ':' + tab.port + ' closed.</span>');
    //reloadLines(data.active_tab);
}

function websocketMessage(evt)
{
    var tab = data.tabs[data.active_tab];
    tab.lines.push('Received: ' + evt.data);
    reloadLines(data.active_tab);
    var main = $('main');
    var height = main[0].scrollHeight;
    main.scrollTop(height);
}
