<?php

// 1. Where your backend files are actually stored on the server
// Since your main project seems to be in a folder called helpdesk_core,
// this path tells the server to go up one folder and into helpdesk_core.
// Change 'helpdesk_core' if your folder name is different on cPanel!
$targetFolder = $_SERVER['DOCUMENT_ROOT'] . '/../helpdesk_core/storage/app/public';

// 2. Where the link needs to be created (inside the current folder)
$linkFolder = $_SERVER['DOCUMENT_ROOT'] . '/storage';

echo "Attempting to link:<br>";
echo "FROM: " . $targetFolder . "<br>";
echo "TO: " . $linkFolder . "<br><br>";

if (file_exists($linkFolder) || is_link($linkFolder)) {
    echo "<b>Status:</b> Found existing 'storage' link or folder.<br>";
    if (is_link($linkFolder)) {
        unlink($linkFolder);
        echo "Deleted old broken link.<br>";
    } elseif (is_dir($linkFolder)) {
        // If it's an actual directory (like what happened on your local machine)
        rmdir($linkFolder);
        echo "Deleted empty storage folder.<br>";
    }
}

// Attempt to create the symlink
if (symlink($targetFolder, $linkFolder)) {
    echo "<b style='color:green;'>Success!</b> Symlink created successfully! Your images should load now.";
} else {
    echo "<b style='color:red;'>Failed.</b> The server denied permission to create the link, or the target folder doesn't exist.<br>";
    echo "Please double-check that the folder 'helpdesk_core' exists right next to your subdomain folder.";
}
?>
