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
      var name, manager, title, team, community;
      if (val.person) {
        name = val.person
        manager = val.manager
        title = val.title
        team = val.team
        community = val.community
      } else {
        name = val[0]
        manager = val[1]
        title = val[2]
        team = val[3]
        community = val[4]
      }
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
      teams[slug(team)] = {
        name: team,
        count:((teams[slug(team)]||{}).count || 0) + 1
      };
      communities[slug(community)] = {
        name: community,
        count:((communities[slug(community)]||{}).count || 0) + 1
      };
      titles[slug(title)] = {
        name: title,
        count:((titles[slug(title)]||{}).count || 0) + 1
      };
      classes.push('team-' + slug(team));
      classes.push('community-' + slug(community));
      classes.push('title-' + slug(title));
      result.className = classes.join(' ');

      return result;
    }

    data = {}
    data.name = 'Top';
    data.title = 'Top';
    data.children = $.map(topPeople, function(name) {
      return genStructure(name, 1);
    });

    return {
      hierarchy: data,
      teams: teams,
      communities: communities,
      titles: titles
    };
  }

  function buildOptionList(target, type, title, options) {
    var option_template = doT.template(
      '<ol>' +
      '<li><input checked type="checkbox" id="{{=it.type}}-toggle-all"><label for="{{=it.type}}-toggle-all">{{=it.title}}</label></li>' +
      '{{~it.options :option:index}}' +
      '<li><input checked type="checkbox" class="{{=it.type}}-toggle" data-{{=it.type}}="{{=option.slug}}" id="{{=it.type}}-{{=option.slug}}"><label for="{{=it.type}}-{{=option.slug}}">{{=option.name}} ({{=option.count}})</label></li>' +
      '{{~}}' +
      '</ol>'
    );

    var option_array = $.map(options, function(obj, slug) {
      return { slug: slug, name: escapeHtml(obj.name), count: obj.count };
    });
    option_array.sort(function(a, b) {
      var namea = a.name.toLowerCase();
      var nameb = b.name.toLowerCase();
      if (namea < nameb) return -1;
      if (namea > nameb) return 1;
      return 0;
    });
    target.html(option_template({options: option_array, title: title, type: type}));
  }

  function buildChart(csvdata) {
    data = buildHierarchy(csvdata);

    $('#chart_container').orgchart({
      'data' : data.hierarchy,
      'nodeContent': 'title',
      'toggleSiblingsResp': false,
      'exportButton': true,
      'exportFileextension': 'pdf'
    });

    buildOptionList($('#team_list'), 'team', 'All teams', data.teams);
    buildOptionList($('#community_list'), 'community', 'All communities', data.communities);
    buildOptionList($('#title_list'), 'title', 'All titles', data.titles);

    return data;
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

  function setTriggers() {
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
  }

  function setColours(type, options) {
    var numColours = 34;
    $(".orgchart .node .title").each(function () {
      var node = $(this);
      for (var col = 1; col <= numColours; col++) {
        node.removeClass('bg-col-' + col);
      }
    });

    var option_array = $.map(options, function(obj, slug) {
      return { slug: slug, name: escapeHtml(obj.name), count: obj.count };
    });
    option_array.sort(function(a, b) {
      if (a.count > b.count) return -1;
      if (a.count < b.count) return 1;
      return 0;
    });

    $.each(option_array, function(i, option) {
      $('.orgchart .node.' + type + '-' + option.slug + ' .title').each(function () {
        var node = $(this);
        node.addClass('bg-col-' + ((i % numColours) + 1));
      })
    })
  }

  window.makeOrgChart = function(csvdata) {
    var data = buildChart(csvdata);
    setTriggers();
    setColours('team', data.teams);
    // setColours('community', data.communities);
    // setColours('title', data.titles);
  }
});
