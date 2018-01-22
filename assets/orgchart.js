$(function() {
  function slug(text) {
    return text.toLowerCase().replace(/[^a-z0-1]+/g, '-');
  }

  function escapeHtml(text) {
    return $('<div/>').text(text).html();
  }

  function buildHierarchy(csvdata) {
    var people = {};
    $.each(csvdata, function(i, val) {
      var name = val[0],
          manager = val[1],
          title = val[2],
          team = val[3],
          community = val[4];
      var record = people[name];
      if (!record) {
        record = {};
        people[name] = record;
      }
      record.name = name;
      record.manager = manager;
      record.title = title;
      record.team = team;
      record.community = community;
      var manager_record = people[manager];
      if (!manager_record) {
        manager_record = {}
        people[manager] = manager_record;
      }
      var manager_reports = manager_record.reports;
      if (!manager_reports) {
          manager_reports = [];
          manager_record.reports = manager_reports;
      }
      manager_reports.push(name);
    })

    var topPeople = [];
    $.each(people, function(name, record) {
      if (!record.manager) {
        topPeople.push(name);
      }
    });

    var teams = {},
        communities = {},
        titles = {};

    function genStructure(name, depth) {
      var record = people[name],
          team = record.team || 'other',
          community = record.community || 'other',
          title = record.title || 'other',
          reports = record.reports;

      var text = escapeHtml(team) + '<br>' + escapeHtml(community) + '<br>' + escapeHtml(title);

      var result = {
        name: escapeHtml(name),
        title: text
      }

      if (reports) {
        result.children = $.map(reports, function(childname) {
          return genStructure(childname, depth + 1);
        });
        result.name = escapeHtml(name) + " (" + result.children.length + ")";
      }

      var classes = [];
      teams[slug(team)] += 1;
      communities[slug(community)] += 1;
      titles[slug(title)] += 1;
      classes.push('team-' + slug(team));
      classes.push('community-' + slug(community));
      classes.push('title-' + slug(title));
      result.className = classes.join(' ');

      return result;
    }

    data = {}
    data.name = 'Kevin Cunnington';
    data.title = 'Kevin Cunnington';
    data.children = $.map(topPeople, function(name) {
      return genStructure(name, 1);
    });
    return data;
  }

  function buildChart(csvdata) {
    data = buildHierarchy(csvdata);
    console.log(csvdata);

    $('#chart-container').orgchart({
      'data' : data,
      'nodeContent': 'title',
      'toggleSiblingsResp': false,
      'exportButton': true,
      'exportFileextension': 'pdf'
    });
  }

  function setMinimised() {
    var communities = $.map(
      $("input.community-toggle"),
      function(input) {
        var checked = $(input).is(':checked');
        if (checked) {
          return $(input).data('community');
        }
        return undefined;
      }
    )
    var teams = $.map(
      $("input.team-toggle"),
      function(input) {
        var checked = $(input).is(':checked');
        if (checked) {
          return $(input).data('team');
        }
        return undefined;
      }
    )
    var titles = $.map(
      $("input.title-toggle"),
      function(input) {
        var checked = $(input).is(':checked');
        if (checked) {
          return $(input).data('title');
        }
        return undefined;
      }
    )

    $(".orgchart .node").each(function () {
      var node = $(this);
      var minimise = false;

      if ($.map(communities, function(community) {
            if (node.hasClass('community-' + community)) return community;
          }).length == 0) {
        minimise = true;
      }

      if ($.map(teams, function(team) {
            if (node.hasClass('team-' + team)) return team;
          }).length == 0) {
        minimise = true;
      }

      if ($.map(titles, function(team) {
            if (node.hasClass('title-' + team)) return team;
          }).length == 0) {
        minimise = true;
      }

      if (minimise) {
        node.addClass("minimised");
      } else {
        node.removeClass("minimised");
      }
    })
  }

  $("input.community-toggle").change(function(e) {
    setMinimised();
  });

  $("input.team-toggle").change(function(e) {
    setMinimised();
  });

  $("input.title-toggle").change(function(e) {
    setMinimised();
  });

  $("input#community-toggle-all").change(function(e) {
    var checked = $(this).is(':checked');
    $("input.community-toggle").each(function(_, input) {
      input.checked = checked;
    });
    setMinimised();
  });

  $("input#team-toggle-all").change(function(e) {
    var checked = $(this).is(':checked');
    $("input.team-toggle").each(function(_, input) {
      input.checked = checked;
    });
    setMinimised();
  });

  $("input#title-toggle-all").change(function(e) {
    var checked = $(this).is(':checked');
    $("input.title-toggle").each(function(_, input) {
      input.checked = checked;
    });
    setMinimised();
  });


  $(".orgchart .node").hover(function() {
    var contents = ($(this).html());
    $(".hovered_node").empty();
    $(this).clone().appendTo(".hovered_node");
  }, function() {
    $(".hovered_node").empty();
  });

  $("#tool-expand>button").click(function(e) {
    var button = $(this);
    var toolbox = $("#tools");
    e.preventDefault();
    if (toolbox.hasClass("collapsed")){
      toolbox.removeClass("collapsed");
      $("#tool-expand>button>i").removeClass("fa-angle-double-right").addClass("fa-angle-double-left")
    } else {
      toolbox.addClass("collapsed");
      $("#tool-expand>button>i").removeClass("fa-angle-double-left").addClass("fa-angle-double-right")
    }
  });

  window.makeOrgChart = function(csvdata) {
    buildChart(csvdata);
  }
});
