Getting Started Guide
=====================

AKA: "Build a blog from scratch in less than 10 minutes."

Install Enginemill
------------------

### Mac and Linux
__Step 1: Download installer.__
Download the [installer script (a raw Python script)](http://www.example.com/installer.py).
On a Mac, your Documents folder is a good place to put it, but it really doesn't
matter, so long as you remember where you downloaded it to. Once the installer script
is downloaded -- it should only take a few seconds -- then all that's left to do
is open a terminal and run it. If this is your first time on a terminal, or if you need
a refresher on running a script from the command line, then make sure to go through the short
aside on the *Command Line Terminal* before you continue. Otherwise, you can skip it
and move on to the next step.

<aside>
### Terminal Command Line
</aside>

__Step 2: Run installer.__
Open your command line terminal, and navigate to the directory where you downloaded
the installer script using the `cd` command. Then all you have to do is run

	python install_enginemill.py

Obviously -- as if you hadn't already noticed -- the Enginemill installer is a
Python script.  It could take as long as several minutes for the script to
finish running, since, if your computer does not already have Node.js
installed, it will need to be installed first, before you can begin using
Enginemill. If you're unfamiliar with Node.js, or just want to better
understand the relationship between Node.js and Enginemill, you should venture
into the *Node.js* aside here. Otherwise, just skip it and move on to the next
step.

<aside>
### Node.js
</aside>

__Step 3: Test your installation.__
Still in the terminal command line, run

	em test_installation

At the end (it takes a few seconds to run), you should see a checkmark like this:

If you get errors, you should report them to the
[support forum](http://www.example.com/support/),
where you should be able to get some help resolving the issues.

The next step is the fun part. Run this command in your terminal:

	em manager

and you should get a message like this:

	Your devserver is now running at localhost:8000
	Have fun building something great!

Then, just put 'localhost:8000' into your web browser, and you should see the
default Enginemill website on display!

If the 'localhost:8000' thing looks weird or confusing to you, or you're just
curious about it, checkout the *Serving A Website from localhost* aside for
more details.

If there are no errors, you're ready to move on to building your first app!


### Windows
TODO

Create an App
-------------
The default starter app for your first Enginemill project is a personal website
with a blog. Of course you can build anything on the web with Enginemill, but
building this site will quickly introduce you to Enginemill before venturing
out on your own.

To create the app

