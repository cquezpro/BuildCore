Getting started
===============

Architecture
------------

In short: backend is in Rails, frontend is in Angular JS(for web, see 'src' folder) and managed by Bower, mobile is done using Ionic (iOS, Andriod, Clover (based on Andriod see 'MobileV6 folder'), background jobs are processed with Sidekiq.  PostgreSQL responds for persitence,
but Redis is also employed.

Prerequisites
-------------

Make sure you have following installed:

1.  Ruby (obviously, see Gemfile to find out which version we currently use)
1.  PostgreSQL, Redis, ImageMagick, GhostScript and Node JS (use package manager
    if your system has one, on OS X Homebrew provides them all)
1.  Gems: Foreman and Bundler (`gem install foreman bundler`)
1.  Node packages: Grunt, Karma and Bower (`npm -g install grunt-cli karma-cli
    bower`)
1.  Editor which recognizes EditorConfig
    ([download a plugin](http://editorconfig.org/#download))

On \*NIX you may need to use `sudo`, depending on your setup.

To make sure the prerequisites are present, run `system_check.rb` script.

Configuration
-------------

As it's 12-factor application, Figaro is used for configuration.

Ask others what to put into `/config/application.yml`.  This may change over
time.

In development, RSA keys should be configured already.  For other environments
refer to MANAGING_RSA_KEYS.

Installation
------------

Install gems in usual way, then Bower dependencies:

    bundle install
    npm install
    bower install

Running
-------
before you migrate be sure to check the `config/database.yml` file is present.  If it is not check for `config/database.yml.sample` and change the file name to `config/database.yml`.

Migrate and populate database:

    redis-server
New Tab:

    rake db:drop
    rake db:migrate
    rake db:seed

Kill the redis server `ctrl+c`

Build Angular frontend:

    grunt watch                   # Frontend
    foreman start -f Procfile.dev # Rails, Sidekiq, Redis

Now visit http://localhost:3000/UI/index.html#/sign-up and play a while,
but not http://localhost:3000/app.html!  Any time you see that your frontend
changes aren't reflected that's because you're on the wrong page.
If you've following this guide precisely, the database is seeded and several
test users are available, notably `asd@asd.com` who uses `asdasd` password.

Staging site
------------

Staging site is available at http://billsync-staging.herokuapp.com/app.  You may
use `asd@asd.com` for e-mail and `asdasd` as password to log in.

Sidekiq monitor
---------------

Sidekiq comes with nice dashboard for browsing and managing background jobs:

1. Unless you're running Foreman with Procfile.dev, run `rake monitor:sidekiq`.
2. Visit http://localhost:9494.
 
Tablet APK Generartion for Clover Station
-------------

1.  check `config.xml` in the tablet folder and make sure to increment the version number.
2.  Check that the API target is correct:  `<preference name="android-minSdkVersion" value="14" /> <preference name="android-targetSdkVersion" value="17" />` 
3.  Change into the tablet folder `cd tablet`
4.  Run the following command to create the apk `cordova build --release android` (see trouble shooting point 1 if you have an issue here).
5.  This will create an apk in the `tablet\platforms\android\build-ant\MainActivity-release-unsigned.apk`
6.  Next move the apk from that folder into the the root tablet folder.
7.  Then sign the apk with the following command `jarsigner -verbose -sigalg SHA1withRSA -sigFile CERT -digestalg SHA1 -keystore my-release-key.keystore MainActivity-release-unsigned.apk billSync` you will be promted for a passcode which is `billsync23`.
9.  Finally you will have to use zipalign to compress.  The easiest way to this is to run the following command (note you need to point to your directory with zipalign and you may need to change the apk name if you already have some apks in the folder `/Users/vijaybrihmadesam/android-sdk-macosx/build-tools/19.1.0/zipalign -v 4 MainActivity-release-unsigned.apk billSyncClover2.apk`
10.  Run this to make sure the cert worked: `unzip -p billSyncClover2.apk META-INF/CERT.RSA | keytool -printcert`.  It should produce the credentails of the certification.

Some trouble shooting advice:
1.  If you get a message when running the cordova build command along the lines of "XXX is not an andriod project" the easiest solution is to delete the folder `tablet\platforms\andriod` and run `ionic platform add android`

Creating iOS Project
-------------
Before testing make sure to add the following cordova plugins:

    cordova plugin add https://github.com/performanceactive/phonegap-custom-camera-plugin
    cordova plugin add org.apache.cordova.camera
    cordova plugin add org.apache.cordova.console
    cordova plugin add org.apache.cordova.file
    cordova plugin add org.apache.cordova.file-transfer
    cordova plugin add org.apache.cordova.inappbrowser


Note:  Must be using OSX with Xcode installed to be able to compile the project.

1. Navigate to `mobile\platforms` and delete the folder `ios`.
2. Update the verision number on line 2 of `mobile\config.xml` be sure to do this as if the version already exists on iTunes connect your submission will be rejected in step 10.
3. Navigate to the `mobile` folder and run the following command `ionic platform add ios`.
4. This will build an xcode project.
5. If you make any changes just run `ionic prepare ios`.
6. Open xcode and find the project here to open: /platforms/ios/billSync.xcodeproj
7. On the top left (very top bar) you will see billSync > [icon] phone name.  Change this to iOS device.
8. Go to the `Product` menu and click `Archive`.
9. Once the buld succeeds, the ornganizer should appear.  Select the proper version and click submit. and follow the prompts
10. Once you get the message "Submission Successful" go to: `https://itunesconnect.apple.com/WebObjects/iTunesConnect.woa`.
11. Login > My Apps > Prerelease > Builds, turn on testflight.  Turn on Testflight, add to external review.  Invites should go out quickly there after!
