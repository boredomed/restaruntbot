var demo = function() {};

demo.prototype = (function() {
  // ******** Configuration

  //REST Server
  var RESTServerIP = "SPKISL825"; // Logical name of the REST Server
  var RESTServerPort = "10086"; // Port of the REST Server
  //var ContentType = "application/vnd.mstr.dataapi.v0+json"; // To be added in each request as a request header
  var ContentType = "application/json"
  //MicroStrategy Intelligence Server
  var IServer = "SPKISL825"; // Logical name of the MicroStrategy IServer
  var IServerPort = 34952; // Port of the MicroStrategy IServer
  var projectName = "PSA Outlook Forecast"; // Name of the MicroStrategy Project
  var username = "administrator"; // Credentials to connect to the MicroStrategy Project
  var password = "bi1234";
  var authMode = 1;

  //MicroStrategy Object
  var isCube = false; // True if running a cube, false if running a report
  var id = "5439646E4C51F2FB42BCD494752D387D"; // Id of the cube or report used
  var itemPerPage = 20; // Number of items the table will display per page

  // ******** Constants

  var BASE_URL =
    "http://" + RESTServerIP + ":" + RESTServerPort + "/json-data-api/";
  var TARGET = isCube ? "cubes/" : "reports/";
  var CURRENT_URL = BASE_URL + TARGET;
  var UPDATE_PAGINATION_MODE = {
    INIT: 0,
    NEXT: 1,
    PREV: 2
  };
  var LIST_VIEW = {
    attribute: 0,
    metric: 1
  };

  // ******** Global variables

  var json; // Contains the retrieved json output
  var authToken; // Contains the session id which will be used in every api call
  var instanceId; // Contains the instance id which is a reference to a report created in memory.
  var paging = {
    // Used to handle pagination
    offset: 0,
    limit: itemPerPage
  };
  var autoload = true; // Determine if the api call should be made as soon as we select at least one attribute and one metric or using a apply button
  var attributeList = null; // Contains the attribute list of the json output
  var metricList = null; // Contains the metric list of the json output
  var attributeListView, metricListView; // Declare list views
  var postBody; // Contains the input body of the api call

  var attributes = [];
  var metrics = [];
  //var root = json.result.data.root;
  var mergedArray = [];
  var data = [];
  var row = [];
  var userSide = "left";
  var botSide = "right";
  var messages = [];
  var previousUserMessage = ""; //keeps track of the previous string from the user
  var botMessage = ""; //var keeps track of what the chatbot is going to say
  var botStatus = "BOT";
  var userStatus = "YOU";

  // ******** Public Functions

  var start = function start() {
      /*  Instructions to be done when loading the js*/

      //$("#chatbotWindow").hide();
      $(document).ajaxStart(function () {
        // Show image container
        //$("#loader").show();
    });
    
     // createSession(); //Create session
      initializeChatBot();

      //Create attribute list view
      attributeListView = createListView(LIST_VIEW.attribute);
      attributeListView.items = [
        {
          name: "Loading attributes..."
        }
      ];
      attributeListView.attach();
      attributeListView.refresh();

      //Create metric list view
      metricListView = createListView(LIST_VIEW.metric);
      metricListView.items = [
        {
          name: "Loading metrics..."
        }
      ];
      metricListView.attach();
      metricListView.refresh();

      //Load the Google Table Chart
      google.charts.load("current", {
        packages: ["table"]
      });
    },

    initializeChatBot = function initializeChatBot() {
      (function() {
        var Message;
        Message = function(arg) {
          (this.text = arg.text),
            (this.status = arg.status),
            (this.message_side = arg.message_side);
          this.draw = (function(_this) {
            return function() {
              var $message;
              $message = $(
                $(".message_template")
                  .clone()
                  .html()
              );

              $message
                .addClass(_this.message_side)
                .find(".text")
                .html(_this.text);
              $message
                .addClass()
                .find(".avatar")
                .html(_this.status);

              $(".messages").append($message);
              return setTimeout(function() {
                return $message.addClass("appeared");
              }, 0);
            };
          })(this);
          return this;
        };

        $(function() {
          var getMessageText, message_side, sendMessage;

          chatbotResponse = function(text) {
            console.log(text);
            text= text.toLowerCase();

            if (text.trim() === "") {
              return;
            } else if (
              text.indexOf("total") !== -1 &&
              text.indexOf("forecasted") !== -1
            ) {
              botMessage = "Here is your answer : ";

              var metric = text
                .substring(
                  text.lastIndexOf("forecasted") + 11,
                  text.lastIndexOf("for")
                )
                .trim();
              var attribute = text
                .substring(text.lastIndexOf("psa") + 4, text.lastIndexOf("?"))
                .trim();
             // var indexMetric = mergedArray.findIndex(index => index.toLowerCase().includes(metric.toLowerCase()));
             var indexMetric = mergedArray.findIndex(index => index.toLowerCase().trim() === metric.toLowerCase());
              
             // var indexAttribute = mergedArray.findIndex(attribute => attribute.toLowerCase().includes(attribute));

              var total = 0;
              for (var i = 0; i < data.length; i++) {
                if (data[i][5].toLowerCase().includes(attribute)) {
                  total = total + data[i][indexMetric].v;
                }
              }

              botMessage = botMessage + total;
              sendMessage(botMessage, botSide, botStatus);
            } else if (
              text.indexOf("comparison") !== -1 &&
              text.indexOf("forecasted") !== -1
            ) {
              botMessage = "Here is your answer : ";

              var metric = text
                .substring(
                  text.lastIndexOf("forecasted") + 11,
                  text.lastIndexOf("for")
                )
                .trim();
              var attribute = text
                .substring(text.lastIndexOf("psa") + 4, text.lastIndexOf("?"))
                .trim();
              // var indexMetric = mergedArray.findIndex(index =>
              //   index.toLowerCase().includes(metric.toLowerCase())
              // );
              var indexMetric = mergedArray.findIndex(index => index.toLowerCase().trim() === metric.toLowerCase());

              attribute = attribute.replace("&", ",");
              var periods = attribute.split(",");

              // var indexAttribute = mergedArray.findIndex(attribute => attribute.toLowerCase().includes(attribute));
              for (var index = 0; index < periods.length; index++) {
                var total = 0;
                for (var i = 0; i < data.length; i++) {
                  if (
                    data[i][5].toLowerCase().includes(periods[index].trim())
                  ) {
                    total = total + data[i][indexMetric].v;
                  }
                }
                botMessage +=
                  "PSA " + periods[index].trim() + ": " + total + ", ";
              }
              botMessage = botMessage.substring(0, botMessage.length - 2);
              sendMessage(botMessage, botSide, botStatus);
            } else if (botMessage.indexOf("name") !== -1) {
              botMessage = "Here is your answer : ";
              console.log(messages.toString());
              pastMessage = messages[messages.length - 3].toLowerCase();
              var metric = pastMessage
                .substring(
                  pastMessage.lastIndexOf("forecasted") + 11,
                  pastMessage.lastIndexOf("of")
                )
                .trim();
              var attributePsa = pastMessage
                .substring(
                  pastMessage.lastIndexOf("psa") + 4,
                  pastMessage.lastIndexOf("?")
                );
              var attribute = text;
              // var indexMetric = mergedArray.findIndex(index =>
              //   index.toLowerCase().includes(metric.toLowerCase())
              // );
              var indexMetric = mergedArray.findIndex(index => index.toLowerCase().trim() === metric.toLowerCase());


              var indexAttribute = mergedArray.findIndex(attribute =>
                attribute.toLowerCase().includes("resource name")
              );

              var res;
              for (var i = 0; i < data.length; i++) {
                if (
                  data[i][indexAttribute]
                    .toLowerCase()
                    .includes(attribute.toLowerCase().trim()) &&
                  data[i][5].toLowerCase().includes(attributePsa.trim())
                ) {
                  res = data[i][indexMetric].v;
                }
              }
              botMessage += res;

              botMessage.substring(0, botMessage.length - 1);
              sendMessage(botMessage, botSide, botStatus);
            } else if (
              text.indexOf("resource") !== -1 &&
              text.indexOf("forecasted") !== -1
            ) {
              botMessage = "Yes, please give me a name";
              sendMessage(botMessage, botSide, botStatus);
            } else if (text.indexOf("information") !== -1) {
              botMessage =
                "You can type 'Help PSA' to see all that I can answer.";
              sendMessage(botMessage, botSide, botStatus);
            } else if (text.indexOf("help") !== -1) {
              //botMessage = "Here are your options:";
              //botMessage += "<br>";
              botMessage = "You can ask anything related to PSA from below list : <br>";

              for (let index = 0; index < metrics.length; index++) {
                botMessage += index + 1 + ") " + metrics[index] + "<br>";
              }

              sendMessage(botMessage, botSide, botStatus);
            } else {
              botMessage = "I dont understand the question";
              sendMessage(botMessage, botSide, botStatus);
            }
          };

          sendResponse = function(text) {
            sendMessage(text, userSide, userStatus);
            previousUserMessage = text;

            return setTimeout(function() {
              return chatbotResponse(text);
            }, 1500);
          };

          getMessageText = function() {
            var $message_input;
            $message_input = $(".message_input");
            return $message_input.val();
          };
          sendMessage = function(text, messageSide, botstatus) {
            var $messages, message;
            if (text.trim() === "") {
              return;
            }
            messages.push(text);
            $(".message_input").val("");
            $messages = $(".messages");
            //message_side = message_side === 'left' ? 'right' : 'left';
            message_side = messageSide;
            message = new Message({
              text: text,
              message_side: message_side,
              status: botstatus
            });
            message.draw();
            return $messages.animate(
              { scrollTop: $messages.prop("scrollHeight") },
              300
            );
          };

          $(".send_message").click(function(e) {
            return sendResponse(getMessageText());
          });
          $(".message_input").keyup(function(e) {
            if (e.which === 13) {
              return sendResponse(getMessageText());
            }
          });

          sendQuery(myCallback);
          sendMessage(
            "Welcome! You are connected with Microstrategy ChatBot. How may I help you today?",
            botSide,
            botStatus
          );
        });
      }.call(this));
    }/*,
    createReport = function createReport() {
      /*  Trigger when clicking on the "apply" button, run a report with the selected attributes and metrics  */
      if (noneOrBothAreEmpty()) {
        if (bothAreEmpty()) {
          // If both are empty get a report with all data of the cube
          postBody = JSON.stringify({});
        } else {
          postBody = JSON.stringify({
            requestedObjects: {
              attributes: attributeListView.items.filter(function(item, i) {
                return attributeListView.selectedIndices[i];
              }),
              metrics: metricListView.items.filter(function(item, i) {
                return metricListView.selectedIndices[i];
              })
            }
          });
        }
        getData();
      }
    },
    getMoreData = function getMoreData() {
      /*  After we run a report, we can reuse it (for performance purpose) using the instanceId reference we got from the first time we run it (using a POST method)  */

      $.ajax({
        type: "GET",
        url:
          CURRENT_URL +
          id +
          "/instances/" +
          instanceId +
          "?offset=" +
          paging.offset +
          "&limit=" +
          paging.limit,
        beforeSend: function(xhr2) {
          xhr2.setRequestHeader("X-MSTR-AuthToken", authToken);
          xhr2.setRequestHeader("Accept", ContentType);
        },
        success: function(data) {
          json = data;
          plotTable();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          if (errorThrown === "Unauthorized") {
            // if the session expired, recreate a new one.
            createSession();
          }
        }
      });
    },
    plotTable = function plotTable() {
      /*  Plot the Google Chart table using the json output of the last api call  */

      // var attributes = [];
      // var metrics = [];
      var root = json.result.data.root;
      // var data = [];
      // var row = [];

      //google.charts.setOnLoadCallback(drawTable);

      // ******** Functions used to plot table

      //function drawTable() {
      /*  Draw the Google Table chart  */
      //  var dataTable = new google.visualization.DataTable();

      var definition = json.result.definition;

      //Add attributes in the columns of the table
      definition.attributes.forEach(function(attribute) {
        // dataTable.addColumn('string', attribute.name);
        attributes.push(attribute.name);
      });

      //Add metrics in the columns of the table
      definition.metrics.forEach(function(metric) {
        // dataTable.addColumn('number', metric.name);
        metrics.push(metric.name);
      });

      search(root); // Flatten the tree structure data into rows (will be added to data)
      console.log(data);
      console.log(metrics);
      console.log(attributes);
      mergedArray = $.merge($.merge([], attributes), metrics);
      console.log(mergedArray);
      // dataTable.addRows(data);

      // var table = new google.visualization.Table(document.getElementById('table_div'));

      // var optionsTable = {
      //     showRowNumber: false,
      //     width: '100%',
      //     height: '100%',
      // };

      // table.draw(dataTable, optionsTable);

      // google.visualization.events.addListener(table, 'page');

      //  }

      // **** Functions to flatten the tree data (using a depth first recursive algorithm)

      function visit(node) {
        /*  Apply what needs to be done when visiting a node
                 *  @param {Object} node visited */

        if (node.element) row[node.depth] = utils.decodeHtml(node.element.name);
        if (node.metrics) {
          metrics.forEach(function(metric, i) {
            row[node.depth + 1 + i] = {
              v: node.metrics[metric].rv,
              f: node.metrics[metric].fv
            };
          });
          data.push(row);
          row = row.slice();
        }
      }

      function search(root) {
        /*  Goes recursively though the input root tree
                 *  @param {Object} root node of the tree to be searched */

        if (root) {
          visit(root);
          root.visited = true;
          if (!root.metrics) {
            root.children.forEach(function(node) {
              if (!node.visited) {
                search(node);
              }
            });
          }
        }
      }
    },
    navNext = function navNext() {
      /*  Triggered when clicking on the next button (right arrow), fetch the next {limit} number of row  */

      updatePagination(json, UPDATE_PAGINATION_MODE.NEXT);
      getMoreData();
    },
    navPrevious = function navPrevious() {
      /*  Triggered when clicking on the previous button (left arrow), fetch the previous {limit} number of row  */

      updatePagination(json, UPDATE_PAGINATION_MODE.PREV);
      getMoreData();
    },
    switchAutoloadMode = function changeAutoloadmode(element) {
      /*  Triggered when checking/unchecking the auto-load checkbox, it switches the auto-load mode
             @param {Object} input checkbox object*/
      autoload = element.checked;
      $("button").prop("disabled", autoload);
      if (autoload) {
        createReport();
      }
    };

  // ******** Internal Functions

  function createSession() {
    /*  Create Session  */
    $.ajax({
      type: "POST",
      url: BASE_URL + "sessions",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("X-IServerName", IServer);
        xhr.setRequestHeader("X-Port", IServerPort);
        xhr.setRequestHeader("X-ProjectName", projectName);
        xhr.setRequestHeader("X-Username", username);
        xhr.setRequestHeader("Accept", ContentType);
        xhr.setRequestHeader("X-Password", password);
        xhr.setRequestHeader("X-AuthMode", authMode);
      },
      success: function(response) {
        authToken = response.authToken;
        getData();
      },
      error: function(e) {
        console.log(e);
      }
    });
  }

    function sendQuery(callback) {


      console.log('In Send Query');
      var query = {"query": "Hi"};
      
      
      $.ajax({
                url: 'http://localhost:5005/conversations/default/parse',
                type: 'POST',
                
                beforeSend: function(xhr) {
                 xhr.setRequestHeader("Accept", ContentType);
                },
                //data:query,
                //timeout:3000,
                data:JSON.stringify(query),
                 success: function(data) { 
                     callback(data)
                },

                error: function( jqXhr, textStatus, errorThrown ){
                    console.log( errorThrown );
                }
            });

      console.log('function ends');
  }
 

 function myCallback(data) {
    console.log("In callback")
    console.log(data);
    sendResponse(data.next_action);
    //do Something}
  };
  function getData() {
    /*  Create report from the Cube using ad hoc metrics and attributes selected from the listviews  */

    var params = {
      type: "POST",
      url:
        CURRENT_URL + id + "/instances?offset=" + 0 + "&limit=" + paging.limit,
      beforeSend: function(xhr2) {
        xhr2.setRequestHeader("X-MSTR-AuthToken", authToken);
        xhr2.setRequestHeader("Accept", ContentType);
      },
      success: function(data) {
        instanceId = data.instanceId;
        json = data;
        paging = json.result.data.paging;
        loadDefinitions(); // get the list of attributes and metrics
        updatePagination(json, UPDATE_PAGINATION_MODE.INIT);
        plotTable();
        
        //$("#loader").hide();
       // $("#chatbotWindow").show();
        
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        if (errorThrown === "Unauthorized") {
          // if the session expired, recreate a new one.
          createSession();
        }
      }
    };
    if (postBody) {
      $.extend(params, {
        data: postBody,
        contentType: ContentType
      });
    }
    $.ajax(params);
  }

  function loadDefinitions() {
    /*  Load the attributes and the metrics list from the json.definitions output  */

    if (attributeList) {
      // The attribute list already exists
      return;
    }
    attributeList = json.result.definition.attributes;
    metricList = json.result.definition.metrics;
    // attributeListView.items = attributeList;
    //  metricListView.items = metricList;
    //  attributeListView.refresh();
    //  metricListView.refresh();
  }

  function noneAreEmpty() {
    /*  Return true if none of list view selections are empty  */
    var isAttributeListEmpty = jQuery.isEmptyObject(
        attributeListView.selectedIndices
      ),
      isMetricListEmpty = jQuery.isEmptyObject(metricListView.selectedIndices);
    return !isAttributeListEmpty && !isMetricListEmpty;
  }

  function bothAreEmpty() {
    /*  Return true if both list view selections are empty  */
    var isAttributeListEmpty = jQuery.isEmptyObject(
        attributeListView.selectedIndices
      ),
      isMetricListEmpty = jQuery.isEmptyObject(metricListView.selectedIndices);
    return isAttributeListEmpty && isMetricListEmpty;
  }

  function noneOrBothAreEmpty() {
    /*  Return if we should make a run report call  */
    return noneAreEmpty() || bothAreEmpty();
  }

  function updatePagination(json, mode) {
    /*  Update pagination offset and enable/disable pagination button
         @param {Object} json output from the last getData or getMoreData API call
         @param {Object} json.result.data.paging object containing pagination information
         @param {int} indicate the source of the update pagination*/

    paging = json.result.data.paging;

    paging.offset +=
      paging.limit * (mode === UPDATE_PAGINATION_MODE.NEXT ? 1 : -1); // update the offset for the next call

    paging.offset = Math.max(0, paging.offset); // the offset can't be negative

    paging.offset = Math.min(paging.offset, paging.total); // the offset can't be negative

    //no more next data to fetch
    $("#nextB").toggleClass(
      "disabled",
      paging.offset + paging.limit >= paging.total
    );

    //no more previous data to fetch
    $("#previousB").toggleClass("disabled", paging.offset <= 0);
  }

  function createListView(listViewNumber) {
    /*  Create a list view object ( for either attributes or metrics )
         @param {int} # of the list view */
    return utils.createListView({
      domNode: $(".object-list")[listViewNumber],
      handleItemClick: function(params) {
        if (autoload) {
          createReport();
        }
      }
    });
  }

  return {
    start: start,
    createReport: createReport,
    switchAutoloadMode: switchAutoloadMode,
    navNext: navNext,
    navPrevious: navPrevious
  };
})();
