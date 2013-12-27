<?php
    $path = 'json/';
    $catid = !isset($_GET['catid']) || $_GET['catid'] == 'null'  ? 1 : intval($_GET['catid']);
    if (is_file($path.$catid.'.json')){
        $json = file_get_contents($path.$catid.'.json');
    }else{
        $json = '';
    };
    echo $json;
?>