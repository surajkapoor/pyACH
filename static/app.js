function KeySort(a, b){
    var x = a.slice(1)
    var y = b.slice(1)
    return x - y;
    }

function name_e(){
    var e_sn = $(this).parents("tr").find(".e_sn").text();
    var e_name = $(this).val();
    var obj = {
        evidence : e_sn,
        content : e_name
        };
    $.get("name_evidence", obj, console.log("success"))
    }

function name_h(){
    var h_sn = $(this).attr('id');
    var h_name = $(this).val();
    var obj = {
        hypo : h_sn,
        content : h_name
        };
    $.get("name_hypo", obj, console.log("success"))
    }

function select_sess(){
    var next_sess = $("#session_select").val()
    var obj = { 
        session : next_sess
        }   
    $.get("/switch_session", obj, redraw)
    }

function set_cred(){
    var sn = $(this).attr('id').split('_')[0]
    var level = $(this).val()
    var obj = {
        evidence : sn,
        cred : level
        }
    $.get("/set_cred", obj, redraw)
    }

function set_rel(){
    var sn = $(this).attr('id').split('_')[0]
    var level = $(this).val()
    var obj = {
        evidence : sn,
        rel : level
        }
    $.get("/set_rel", obj, redraw)
    }

function set_consistency(){
    var e_sn = $(this).attr('id').split('_')[0]
    var h_sn = $(this).attr('id').split('_')[1]
    var level = $(this).val()
    var obj = {
        e : e_sn,
        h : h_sn,
        consistency : level
        }
    $.get("/set_consistency", obj, redraw)
    }

function redraw(app_state){
        var selecter = $("<select>").attr("id", "session_select").change(select_sess).append($("<option>").append("Select Session"))
        for (var a in app_state.sessions){
            var sn = app_state.sessions[a]
            selecter.append($("<option>").attr("value", sn).append(sn))
        }
        $("#session_select").replaceWith(selecter)

        $("#session_title").replaceWith($("<div>").attr("id", "session_title").append($("<h2>").append(app_state.session)))
        var table = ($("<table>").attr("id", "comp_hypothesis_table")
            .append($("<thead>")
            .append($("<tr>").append($("<td>")).append($("<td>")).append($("<td>")).append($("<td>")).attr("id", "hypo_scores"))
            .append($("<tr>").append($("<td>")).append($("<td>")).append($("<td>")).append($("<td>")).attr("id", "hypo_names"))
            .append($("<tr>").attr("id", "headers")
            .append($("<th>").append("Evidence"))
            .append($("<th>").append("Evidence Description"))
            .append($("<th>").append("Credibility"))
            .append($("<th>").append("Relevance"))))
            .append($("<tbody>")))

        var hypotheses = Object.keys(app_state.hypotheses)
        hypotheses.sort(KeySort)
        for (var h in hypotheses){
            var key = hypotheses[h]
            var hypothesis = app_state.hypotheses[key]
            var h_name = $("<td>").append($("<textarea>").attr("id", hypothesis.sn).attr("rows", "8").val(hypothesis.content)
                .addClass("h_name").change(name_h))

            table.find("#hypo_scores").append($("<td>").append(app_state.scores[key].toFixed(2)))
            table.find("#headers").append($("<th>").append(hypothesis.sn))
            table.find("#hypo_names").append(h_name)
        }

        var evidences = Object.keys(app_state.evidences)
        evidences.sort(KeySort)     
        for (var e in evidences){
            var e_key = evidences[e]
            var evidence = app_state.evidences[e_key]
            var cred_id = evidence.sn+"_cred"
            var rel_id = evidence.sn+"_rel"
            var row = $("<tr>")
                .append($("<td>").append(evidence.sn).addClass("e_sn"))
                .append($("<td>").append($("<input>").attr("type", "text").attr("value", evidence.content).addClass("e_name").change(name_e)))

            var cred_select = $("<td>").append($("<select>").append($("<option>").attr("id", evidence.sn+"cred_low").append("low"))
                                       .append($("<option>").attr("id", evidence.sn+"cred_med").append("medium"))
                                       .append($("<option>").attr("id", evidence.sn+"cred_high").append("high")).val(evidence.credibility).attr("id", cred_id).change(set_cred));

            var rel_select = $("<td>").append($("<select>").append($("<option>").attr("id", evidence.sn+"rel_low").append("low"))
                                       .append($("<option>").attr("id", evidence.sn+"rel_med").append("medium"))
                                       .append($("<option>").attr("id", evidence.sn+"rel_high").append("high")).val(evidence.relevance).attr("id", rel_id).change(set_rel));
            rel_select.val(evidence.relevance)
            row.append(cred_select);
            row.append(rel_select);
            for (var h in app_state.hypotheses){
                var h_key = app_state.hypotheses[h].sn
                var hypothesis = app_state.hypotheses[h_key]
                var cell = $("<td>")
                var selecter = $("<select>").append($("<option>").attr("id", evidence.sn+hypothesis.sn+"_II").append("--"))
                                                         .append($("<option>").attr("id", evidence.sn+hypothesis.sn+"_II").append("II"))
                                                         .append($("<option>").attr("id", evidence.sn+hypothesis.sn+"_I").append("I"))
                                                         .append($("<option>").attr("id", evidence.sn+hypothesis.sn+"_N").append("N"))
                                                         .append($("<option>").attr("id", evidence.sn+hypothesis.sn+"_C").append("C"))
                                                         .append($("<option>").attr("id", evidence.sn+hypothesis.sn+"_CC").append("CC"))
                                                         .attr("id", evidence.sn+"_"+hypothesis.sn).change(set_consistency)
                if (h_key in app_state.matrix[e_key]){
                    selecter.val(app_state.matrix[e_key][h_key])
                    }
                cell.append(selecter)
                row.append(cell)
                }
            table.append(row)
            }
        $("#comp_hypothesis_table").replaceWith(table)
    }       
    

$("#newevi").click(function(data, status){
        $.get("/add_evidence", function(app_state, app_status){
            redraw(app_state)
        })
    })

$("#newhypo").click(function(data, status){
    $.get("/add_hypothesis", function(app_state){
        redraw(app_state)
        })
    })

$("#newsess").click(function(data, status){
    $.get("/new_session", function(app_state){
        redraw(app_state)
        })
    })

$(document).ready(function(){
    $.get("/get_state", function(app_state){
        redraw(app_state)
        })
    })