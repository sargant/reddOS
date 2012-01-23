reddOS
======

**A delightful webOS-based reddit client for the HP TouchPad**

Instructions on desktop testing
-------------------------------

**Note:** *the web browser component is a special webOS component and will not work in a desktop browser, therefore you will not be able to visit links within the app. Click the "pop-out" button in the story viewer to open the link in a new browser window.*

You will need:

* Linux or Mac OSX
* Google Chrome
* The [HP webOS SDK](https://developer.palm.com/content/resources/develop/sdk_pdk_download.html) (You do **NOT** need Java or the VirtualBox emulator, just the SDK)

To run:

1. Edit the `index.html` file so that the `<script>` file points at the location of the SKD on your system. The default is correct for most Linux installs.
2. Close all existing Google Chrome windows.
3. Launch the `linux_browser_debug.sh` script from this directory
