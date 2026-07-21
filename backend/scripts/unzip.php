<?php
// Simple extraction script to bypass CloudLinux LVE limits when running npm install on cPanel.
$zip = new ZipArchive;
if ($zip->open('/home/clickeat/nodeapp/backend.zip') === TRUE) {
    // Extract everything to the nodeapp directory
    $zip->extractTo('/home/clickeat/nodeapp/');
    $zip->close();
    
    // Delete the temporary zip archive
    unlink('/home/clickeat/nodeapp/backend.zip');
    echo 'UNZIP_SUCCESS';
} else {
    echo 'UNZIP_FAILED';
}

// Delete this script after execution for security
unlink(__FILE__);
?>
