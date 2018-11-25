var zero = "0";
// var all_assigns;

function init(){
    $("#ip-number").val(0);
    
}

$(document).ready(function(){
    init();
    
    $("#ip-type").change(function(){
        if ($(this).val() == "IP4"){
            $("#ip-class-option").prop('disabled', false);
            $("#ip-class").prop('disabled', false);
            $("#ip-mask").prop('disabled', true);
        } else {
            $("#ip-class-option").prop('disabled', true);
            $("#ip-class").prop('disabled', true);
            $("#ip-mask").prop('disabled', false);
        }
    });

    $("#ip-class-option").change(function(){
        if ($(this).val() == "CLASS"){
            $("#ip-class").prop('disabled', false);
            $("#ip-mask").prop('disabled', true);
        } else {
            $("#ip-class").prop('disabled', true);
            $("#ip-mask").prop('disabled', false);
        }
    });

    $("#ip-assign-btn").click(function(){
        var cur_ip_type = $("#ip-type").val();
        var cur_ip_class_option = $("#ip-class-option").val();
        var cur_ip_class = $("#ip-class").val();
        var cur_ip_mask = $("#ip-mask").val();
        var cur_ip_number = parseInt($("#ip-number").val());
        if (cur_ip_number) {
            $(".status").html("Loading...");
            $(".ip-list").html("");
            var iplist = getIpList(cur_ip_type, cur_ip_class_option, cur_ip_class, cur_ip_mask, cur_ip_number);
        } else {
            $(".status").html(
                '<div class="alert alert-warning">'+
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
                    '<strong>Warning!   </strong>Please input correctly with only number'+
                '</div>'); 
            $("#ip-number").focus();
        }

        // alert(cur_ip_type+cur_ip_class_option+cur_ip_class+cur_ip_mask+cur_ip_number);
    });

    $("#clear-btn").click(function(){
        localStorage.clear();
    })

});
function getSurfixNum(ip_number){
    // 01111111, 01111111, 01111111, 01111111,
    // 01111111(net_index)|, 01111111, 01111 (prefix)| 111, 01111111,(surfix--->get)
    var len = 1;
    var tol = 2;
    while ((tol - 2) < ip_number) {len++; tol*=2;}
    return len;
}
// function getKeyNet(startindex, prefixlen, surfixlen){
//     startindex = startindex.split(".");
//     let len = startindex.length;
//     // // keynet = parseInt(startindex[len-1]) + surfixlen -2;
//     startindex[0] = (parseInt(startindex[len-1]) + surfixlen - 2).toString();
//     // if 
//     keynet = startindex.join(".");
//     // alert    
//     // localStorage.setItem("assigned_ips",JSON.stringify([{keynet:keynet, prefix:"111", mask:"234.123.123.112",account:3}]));
//     // console.log(JSON.parse(localStorage.getItem("assigned_ips")));

//     // alert(keynet);
//     // return keynet;
// }
function getSubnetMask(surfixlen){
    var networkbits = 32 - surfixlen;

    var subnetMask = "";
    var i = 0, r_m= 0;
    var n = parseInt(networkbits / 8);
    var r = networkbits % 8;
    while (n--) {subnetMask += "255."; i++;}
    // alert(subnetMask);
    while (r--) {r_m += Math.pow(2, 7-r)}
    subnetMask += r_m; i++
    // alert(subnetMask);
    while (i < 4) {
        subnetMask += ".0";
        i++;
    }
    // alert("subnetMask:"+subnetMask);
    return subnetMask;
}
function assignIpAddress(ip_class, ip_number){
    var starindex;
    var endindex;
    var prefixlen;
    var max_ips_num;
    switch (ip_class) {
        // A Class
        // 01111111, 01111111, 01111111, 01111111,
        // 01111111(net_index)|, 01111111, 01111 (prefix)| 111, 01111111,(surfix)
        // ketnet: 
        // prefixlen possible_surfixlen:
        case "A":
            startindex  = "00000001";
            endindex    = "01111111";
            max_ips_num = 16777214;
            break;
        case "B":
            startindex  = "1000000000000000";
            endindex    = "1011111111111111";
            max_ips_num = 65534;
            break;
        case "C":
            startindex  = "110000000000000000000000";
            endindex    = "110111111111111111111111";
            max_ips_num = 254;
            break;
        case "D":
            startindex  = "11100000000000000000000000000000";
            endindex    = "11101111111111111111111111111111";
            // $(".status").html("D Class can not be assigned globally!");
            // return false;
            break;
        case "E":
            startindex = "240.0.0.0";
            endindex = "255.0.0.0";
            $(".status").html(
                '<div class="alert alert-warning">'+
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
                    '<strong>Warning!   </strong><strong>E Class</strong> can not be assigned addresses globally'+
                '</div>'); 
            return false;
        default:
            alert(ip_class + "Class is not exists");
            return false;
    }
    if (ip_number > max_ips_num) {
        $(".status").html(
            '<div class="alert alert-warning">'+
                '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
                '<strong>Warning!   </strong><strong>'+ ip_number +'</strong> addresses can not be assigned as <strong>'+ip_class+'</strong> Class'+
            '</div>'); 
        return;
    } else {
        // prefixlen = possible_surfixlen - surfixlen;
        // subnetMask = getSubnetMask(surfixlen);
        // $(".status").html("subnetMask: "+subnetMask);        
        // localStorage.setItem("assigned_ips",JSON.stringify([{subnet:"11111111111", count:"23", ips:["111111111110001","111111111110002"]},{subnet:"111111111234111", count:"23"},{subnet:"11111234121111111", count:"23"}]));
        
        var all_assigns = JSON.parse(localStorage.getItem("assigned_ips")); 

        if (!all_assigns) all_assigns = [];
        // console.log(all_assigns);
       
        var con = true;
        var len = all_assigns.length;
        var currentNet = startindex;
        var ips;
        if ( ip_class=="A" || ip_class=="B" || ip_class=="C" )
            while (true) {
                var i = 0;
                var len = all_assigns.length;
                var exists = false;
                while (i < len){
                    if (currentNet == all_assigns[i++].subnet) {exists = true; break;}
                }
                if (exists) {
                    if (currentNet == endindex){
                        $(".status").html(
                            '<div class="alert alert-danger">'+
                                '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
                                '<strong>Failure!   </strong><strong>'+ ip_number +'</strong> ip addresses assignment was failed'+
                            '</div>');
                        return;
                    }
                    var len = currentNet.length;
                    currentNet = (parseInt(currentNet, 2) + 1).toString(2);
                    var zeros = zero.repeat(len-currentNet.length);
                    currentNet = zeros + currentNet;
                    continue;
                } else {
                    ips = generatorABCIPS(currentNet, ip_number, 'dec');
                    var new_assign = {class:ip_class, subnet: currentNet, count:ip_number, ips: generatorABCIPS(currentNet, ip_number, 'bin')};
                    all_assigns.push(new_assign);
                    localStorage.setItem("assigned_ips", JSON.stringify(all_assigns));
                    console.log(all_assigns);
                    break;
                }
            }
        else if (ip_class=="D") {
                var len = all_assigns.length;
                i = len;
                exists = false;
                while (i-- > 0){
                    if (all_assigns[i].class == 'D') {exists = true; break;}
                }
                if (exists){
                    var count = all_assigns[i].count;
                    var currentip = all_assigns[i].ips[count-1];
                }else{
                    var currentip = startindex;
                }
                ips = generatorDIPS(currentip, ip_number, 'dec');
                if (ips.length){
                    var new_assign = {class:ip_class, count:ip_number, ips: generatorDIPS(currentip, ip_number, 'bin')};
                    all_assigns.push(new_assign);
                    localStorage.setItem("assigned_ips", JSON.stringify(all_assigns));
                    console.log(all_assigns);
                }
        }
        ips.forEach(function(item, index){
            $(".ip-list").append("<p class='ip-item col-sm-3'>"+item+"</p>");
        }) 
        $(".status").html(
            '<div class="alert alert-success">'+
                '<button type="button" class="close" data-dismiss="alert">&times;</button>'+
                '<strong>Success!   </strong><strong>'+ ip_number +'</strong> ip addresses was assigned successfully'+
            '</div>');
    }
    
    // alert(starindex);
}
function generatorABCIPS(currentNet, ip_number, basecode){
    var prefixlen = currentNet.length;
    var surfixlen = 32 - prefixlen;

    var i = 0;
    var result = [];
    while (i < ip_number){
        i++;
        var ip = parseInt(i, 10).toString(2);
        var zeros = zero.repeat(surfixlen-ip.length);
        ip = currentNet + zeros + ip;
        ip2 = ""
        for (j = 0; j < 4; j++){
            var octet = ip.substring(8*j, 8*j+8);
            if (basecode == 'dec')
                octet = parseInt(octet, 2).toString();
            ip2 += octet;
            if (j < 3) ip2 += "."
        }
        result.push(ip2);        
    }
    return result;
}

function generatorDIPS(pcurrentip, ip_number, basecode){
    console.log(pcurrentip);
    var currentip = pcurrentip.replace(/\./g, '');
    var i = 0;
    console.log(currentip);
    var result = []
    while(i<ip_number){
        i++;
        var ip = parseInt(currentip, 2) + i;
        ip = parseInt(ip, 10).toString(2);
        if (ip == "11101111111111111111111111111111"){
            return [];
        }
        var ip2 = "";
        for (j = 0; j < 4; j++){
            var octet = ip.substring(8*j, 8*j+8);
            if (basecode == 'dec')
                octet = parseInt(octet, 2).toString();
            ip2 += octet;
            if (j < 3) ip2 += "."
        }
        result.push(ip2);
    } 
    return result;
}
function getIpList(ip_type, ip_class_option, ip_class, ip_mask, ip_number){
    var surfixlen = getSurfixNum(ip_number);
    assignIpAddress(ip_class, ip_number);
    return [];
}