$(function() {
  window.makeOrgChart = function(data) {

      $('#chart-container').orgchart({
        'data' : data,
        'nodeContent': 'title',
        'toggleSiblingsResp': false,
        'exportButton': true,
        'exportFileextension': 'pdf'
        // 'verticalDepth': 10,
      });

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
    }
});
