<template>
  <div class="user-guide">
        <div class="navigation">
            <a :href="'#'+getName(heading)" :class="{navItem: true, h1: heading.nodeName==='H1', h2: heading.nodeName==='H2', h3: heading.nodeName==='H3', h4: heading.nodeName==='H4'}" :key="index" v-for="(heading, index) in navigationData">
                {{heading.innerText}}
            </a>
        </div>
        <div class="helpWrapper">
            <div ref="help" class="help">
                <h1 id="basics">The basics</h1>
                <p>In this chapter you will learn what out-of-tune is and how you can utilize it to find awesome new music!</p>
                <h2 id="whatisoot">What is out-of-tune?</h2>
                <p>   
                    With out-of-tune we want to give everyone the opportunity to break out of their own bubble. 
                    We think that everyone should be able to find music on their own, without being influenced by advertisements or big music labels.
                    So we encourage you to break out of your comfort zone and listen to music you have never heard of before!
                </p>
                <p>
                    To accomplish this, we utilize a <a href="https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)">graph</a> to visualize the world of music.
                </p>
                <h2 id="whocanuse">Who should use out-of-tune?</h2>
                <p>
                    Everybody can use out-of-tune! With our graph-based approach, we try to make exploring music more fun. 
                    Especially if you are a music enthusiast and/or data analyst, you will be delighted by this fresh approach.
                    You are empowered to explore the world of music in a completely new way -
                    Find unfamiliar artists, listen to obscure songs or just browse the latest hits. 
                    Navigating a graph is less tedious than scrolling through playlists, and gives you a whole new perspective of the relations between different genres and artists. 
                </p>
                <p>
                    You can also use out-of-tune if you want to visualize your personal playlists. 
                    Feel free to load some of them from Spotify and share the screenshots with all of your friends!
                </p>
                <p>
                    If you are a developer, you might draw some inspiration from out-of-tune. 
                    If you find our way of utilizing a graph interesting and would like to contribute, or just peek at our sourcecode, you can check out our <a href="https://github.com/out-of-tune/OOT">codebase</a> and work on it.
                    You can also let out-of-tune be your inspiration for your very own project!
                </p>
                <h2 id="howworksoot">How does out-of-tune work?</h2>
                <p>There are four types of different "nodes" (the connected dots you see in the network): Genres, artists, albums and songs.</p>
                <p>The nodes are connected to each other with edges (also called links). These links symbolize a connection between two different nodes. 
                    For example: Bob Marley plays reggae. In the graph you will see a connection between these two nodes: 
                    <img alt="connection example" src="@/assets/images/connection_example.png" />
                </p> 
                <p>
                    And that's how out-of-tune basically works! You can now go on and explore all interactions by yourself, or you take a quick look at the <a href="#basicusage">basic usage</a>
                </p>
                <h2 id="howcaniuseoot">How can I use out-of-tune?</h2>
                <p>Just go to <a href="https://app.out-of-tune.org">app.out-of-tune.org</a> and start exploring!</p>
                <p>If you are a developer: You can check out the source code <a href="https://github.com/out-of-tune/OOT">on GitHub</a>.</p>
                <h2 id="dollares">Do I have to pay for it?</h2>
                <p>No, out-of-tune is free, only some features require a Spotify (premium) account.</p>
                <h2 id="supportUs">How can I support out-of-tune?</h2>
                <p>Just use out-of-tune and show it to your friends!</p>
                <p>If you are a developer you can contribute <a href="https://github.com/out-of-tune/OOT">on GitHub</a></p>
                <h2 id="spotifyaccount">Do I have to have a Spotify account? And does it have to be a Premium account?</h2>
                <p>No you don’t necessarily need one, but some features are only accessible with an account. With the free account you can:
                    <ul>
                        <li>Visualize your Spotify playlists</li>
                        <li>Export songs to your account</li>
                    </ul>
                </p>
                <p>With a premium account you can additionally:
                    <ul>
                        <li>Start playback on another device</li>
                        <li>Send your queue to your Spotify application</li>
                    </ul>
                </p>
                <h1 id="basicusage">Basic usage</h1>
                <p>In out-of-tune you use your mouse to navigate through the graph. There are also some <a>keyboard shortcuts</a> that will make your life easier.</p>
                <p>You can click on every node you see: Depending on which mode you are currently using, some nodes will be added or removed</p>
                <p>There are three basic "modes", which determine what happens when you click on a node:</p>
                <img src="@/assets/images/modes.png" alt="Listed modes" />

                <h2 id="expand">Expand</h2>
                <p>When you click on a node and the expand mode is active, multiple things will happen:
                <ul>
                    <li>Depending on your <a href="#confiugration">configuration</a>, nodes with a certain connection to the clicked node will be added to the graph</li>
                    <li>Informations will be displayed in the <a href="#nodeinfo">Node Information box</a></li>
                    <li>The clicked node will be marked white</li>
                </ul>
                <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/IwomgvwcjG8?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=IwomgvwcjG8"
                        frameborder="0"></iframe>
                </p>
                <h2 id="collapse">Collapse</h2>
                <p>When you click on a node and the collapse mode is active, multiple things will happen:
                    <ul>
                        <li>Depending on your <a href="#settings">configuration</a>, links to connected nodes will be removed. If the formerly connected nodes have no connections left, the node itself will be removed too.</li>
                        <li>Informations will be displayed in the <a href="#nodeinfo">Node Information box</a></li>
                        <li>The clicked node will be marked white</li>
                    </ul>
                    <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/5W7PbcjOqAo?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=5W7PbcjOqAo"
                        frameborder="0"></iframe>
                </p>
                <h2 id="explore">Explore</h2>
                <p>When you click a node and the explore mode is active, you will see following things:
                    <ul>
                        <li>Informations will be displayed in the <a href="#nodeinfo">Node Information box</a></li>
                    </ul>
                </p>
                <h2 id="pauseresume">I can’t click on the nodes, they are moving to fast. Is there a way to pause?</h2>
                <p>Yes, you can stop all movement with the SPACEBAR. To resume, just press SPACE again.</p>
                <p>Bear in mind that the nodes will be frozen in place: When you add new nodes they will stay in place and the graph will get cluttered.</p>
                <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/shHUvrVYohk?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=shHUvrVYohk"
                        frameborder="0"></iframe>
                <h2 id="highlight">There are too many connections on the screen, I can't see the nodes.</h2>
                <p>You can press H to activate the highlight mode; When you hover over a node, it and all its connections will be highlighted.</p>
                
                <h1 id="nodeinfo">Node info</h1>
                <p>
                    You can always see the type of the node and an corresponding image. You can click on the name below the image to find the corresponding node in the graph (if it is present in the graph).
                    You can also look the node up on Spotify and listen to the music there.
                </p>
                <img src="@/assets/images/NodeInfoBox.png" alt="Node info box"/>

                <p>If the node is an artist or album you will additionally see a list of songs. You can click on any of them to listen to them song. You can also add them to the queue by clicking on the + button.</p>

                <h2 id="nodeinfofocusnode">How do I focus on the node when I only see the node info?</h2>
                <p>You can click on the name of the genre/artist/album/song and you will jump to the corresponding node (if it is in the graph).</p>

                <h2 id="nodeinfoopen">I closed the node information window, how do i open it again?</h2>
                <p>You can open (and close) it with the information button on the bottom right corner.</p>
                <img src="@/assets/images/open_node_info.png" alt="Open and close Node info"/>

                <h1 id="settings">Settings</h1>
                <p>You can access the settings by pressing the settings button on the right toolbar.</p>
                <p>There are two different types of configurations: edge configuration and node configuration. You can switch between them by pressing the corresponding button on the top of the page.</p>

                <h2 id="nodeconfiguration">Node configuration</h2>
                <p>Every node type has its own set of settings. For each node type you can configure a different behaviour and a different style.</p>
                <img src="@/assets/images/configuration_row.png" alt="full setting row"/>

                <h3 id="#expandcollapse">Expand/collapse</h3>
                <p>You can enable and disable connections for the expand (e) and collapse (c) mode. This dictates which types of nodes will be added/removed when you click on a node.</p>
                <h4 id="expandcollapseexample">Example</h4>
                <!-- not exactly clear -->
                <img src="@/assets/images/expand_example1.png" alt="Example configuration" />
                <p>If you click on an artist in expand mode, only his albums will be added. In collapse mode all connected genres and albums will be removed.</p>
                <p>If you click on a genre, only all artist that play that genre will be added, nothing will happen on collapse.</p>

                <h3 id="color">Color</h3>
                <p>You can color nodes based on the data they contain. You can define as many rules as you want by entering an attribute, an operator and a value to compare to (same operators and attributes possible as in <a href="#search">Search</a>).</p> 
                <img src="@/assets/images/color_setting.png" alt="Color setting example" />
                <p>Rules are prioritized by their order in the list: When a node would be affected by multiple rules, the one farthest down will dictate the color. You can change the order by dragging and dropping those rules, or remove them by clicking the delete button on the right hand side of a rule.</p>

                <h3 id="size">Size</h3>
                <p>You can change the size of nodes based on the data they contain. You can define as many rules as you want by entering an attribute an operator and a value to compare to (same operators and attributes possible as in <a href="#search">Search</a>).</p>
                <img src="@/assets/images/size_setting.png" alt="Size setting example" />
                <p>Rules are prioritized by their order in the list: When a node would be affected by multiple rules, the one farthest down will dictate the size. You can change the order by dragging and dropping those rules, or remove them by clicking the delete button on the right hand side of a rule.</p>
                <p>You can also add a mapping, by writing a valid statement (it must have an compare value and any operator, although it is irrelevant later on, because only the attribute name will be taken) and adding it with the bottom “Add” button. A map-rule takes a range of values, and maps them to the size of the nodes. You can change the minimal and maximum value of the size of the nodes in their corresponding fields.</p>
            
                <h4 id="mappingexample">Mapping example</h4>
                <p>The popularity of an artist is between 0 and 100. The min and max value are set to 20 and 40. The rule is: popularity=12. Now, when the ADD button is clicked, a rule will be added that takes the lowest value of the popularity (0) and maps it to 20. 100 becomes 40. Every other value will be mapped in between: A popularity of 50 becomes 30. A popularity of 75 becomes 35.</p>

                <h2 id="edgeconfiguration">Edge configuration</h2>
                <p>You can choose a color for each type of Edge. This color dictates the color of the links between certain nodes in the frontend.</p>
                
                <h2 id="tooltipGuide">Tooltip</h2>
                <p>In the tooltip setting you can change what data will be shown when you hover a node.</p>

                <h1 id="musicplayer">Music player</h1>
                <p>The music player is located on the bottom of the page. You see the currently playing song and the artist that performs it.</p>
                <p>In the center are the controls: You can pause, play, skip to the next song in the <a href="queue">queue</a> or change the progress of the song.</p>
                <p>You can change the volume with the volume control on the far right.</p>
                <p>If you want to close/open the queue display and the node information box, you can do that with the button between the volume control and the music player.</p>

                <h2 id="nosongsample">I clicked on a song and don’t hear any music, why?</h2>
                <p>There might be no sample for your song present: If this is the case you will see that the song is greyed out in the Node info box.</p>
                <img src="@/assets/images/no_samples_info.png" alt="no sample info"/>

                <h2 id="findplayingnode">How do I find the corresponding node to the song that is now playing?</h2>
                <p>You can click on the song/artist name in the music player: You will be guided to the corresponding node, if it is present in the graph.</p>
                
                <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/UFYl9Zv61jw?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=UFYl9Zv61jw"
                        frameborder="0"></iframe>
                <h1 id="queue">Queue</h1>
                <p>The queue contains all songs that are in queue and that have been played before. You can open the queue by clicking the “queue” button on the right hand side of the <a href="#musicplayer">Music player</a>.</p>
                <img src="@/assets/images/queue.png" alt="queue" />
                <p>You can change the queue order by dragging the songs further to the top or bottom.</p>
                <h2 id="skipsong">I want to skip to a specific song</h2>
                <p>You can change songs by clicking the songs on the list.</p>

                <h2 id="removesongs">I want to remove song(s) from the queue</h2>
                <p>You can remove a song by clicking the “delete” button on the left side of the song. The whole queue can be cleared with the delete button in the top right corner.</p>

                <h2 id="playondevice">Can I play the queue on a different device?</h2>
                <p>Yes, if you have Spotify premium you can click the button next to the close and delete buttons. This will send the whole queue to the device you are currently listening to.</p>

                <h2 id="addSongToPlaylist">I want to add song(s) to a playlist</h2>
                <p>If you are logged in to Spotify, you can add a song to the <a>currently selected playlist</a> by clicking on the icon on the right hand side of the song.</p>

                <h1 id="selection">Selection</h1>
                <p>You can select nodes several ways:
                <ul>    
                    <li>Pressing SHIFT and dragging a rectangle around nodes</li>
                    <li>Selecting nodes via the <a href="#graphsearch">Graph search</a></li>
                </ul>
                <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/Z2T1aN_Ae1A?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=Z2T1aN_Ae1A"
                        frameborder="0"></iframe>
                </p>
                <h2 id="selectionactions">What can I do with selected nodes?</h2>
                <p>You can do several things with selected nodes:
                <ul>
                    <li><a href="expandcollapse">Expand and collapse</a> all of them</li>
                    <li>Pin and unpin them</li>
                    <li>Sort them</li>
                    <li>Add the selected nodes to the queue/a playlist</li>
                    <li>Remove the selected nodes</li>
                    <li>Invert the selection</li>
                </ul>
                </p>

                <h2 id="addtoselection">I missed one node while selecting with a rectangle. Can I add nodes to my selection?</h2>
                <p>Yes, by pressing Ctrl+SHIFT and dragging a rectangle around the nodes you can add them to your current selection.</p>
                <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/6WX_HFciyMI?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=6WX_HFciyMI"
                        frameborder="0"></iframe>

                <h2 id="fittoscreen">I only see a black screen instead of a graph. How do I fix this?</h2>
                <p>You can press F on your keyboard to refocus the graph; This will move and adjust the zoom level so that you can see your current selection. If you don’t have anything selected the whole graph will be centered and shown.</p>
                <p>If this doesn’t help you might not have loaded any nodes - try loading a graph or refreshing the whole page.</p>

                <h2 id="removeselection">How can I remove a selection?</h2>
                <p>Pressing the ESC key will delete all selections.</p>

                <h2 id="selectall">How can I select all nodes at once?</h2>
                <p>Pressing Ctrl + A will add all nodes to the selection.</p>

                <h1 id="saveload">I/O</h1>
                <p>
                    In out-of-tune you have two options to store your found graphs:
                    You can either store and load graphs and configurations in your browser or download/upload them.
                </p>
                <p>If you save a graph, only the nodes, links and the positions of the nodes will be saved. The color, size and all other settings will be saved in configurations.</p>
                <h2 id="save">Save</h2>
                <p>You can save your graph by clicking on the save icon in the toolbar. You can now choose between graph and configuration.
                    Now you can enter a name for your graph, and save it. If you pick a name that was already saved, it will be overwritten.
                    eQc6kP8bZn8
                <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/eQc6kP8bZn8?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=eQc6kP8bZn8"
                        frameborder="0"></iframe>
                </p>
                <h2 id="load">Load</h2>
                <p>
                    If you want to open a previously stored graph you have to open the save/load menu. You can now pick the desired graph/configuration from a dropdown list. 
                    Click on the load button to instantly load the stored object.
                <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/YUjqP_hB_b0?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=YUjqP_hB_b0"
                        frameborder="0"></iframe>
                </p>
                <h2 id="loadplaylist">Loading and visualizing playlists</h2>
                <p>You can visualize playlist by clicking on the PLAYLISTS button on the toolbar. If you are logged in you can choose a playlist and load it. This will generate a 
                <h2 id="deleteGraph">How can I delete a stored graph or configuration?</h2>
                <p>In the save/load options you can pick a graph/configuration with the dropdown and click on the delete button on the right hand side. </p>
                <h2 id="resetconfiguration">How do I reset my configuration?</h2>
                <p>You can rest your configuration in the Save/Load options. When you click on the configuration tab you will find the "RESET CONFIGURATION" button on the bottom.</p>
                <h1 id="search">Search</h1>
                <p>There are two basic search modes:
                <ul>
                    <li>search all</li>
                    <li>search graph</li>
                </ul>
                </p>
                <p>You can switch between these modes by clicking on the link on the right hand side.</p>

                <h2 id="allsearch">Search All</h2>
                <p>
                    The search all function works like any other search: You enter a text and press ENTER or click on the button next to the field.
                    The result will be added as nodes.
                </p>
                <img src="@/assets/images/searchbar_search_all.png" alt="searchbar" />
                <p>With the dropdown you can specify which type of node you want as your result. (e.g. only genres)</p>
                <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/MforwPQbF-U?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=MforwPQbF-U"
                        frameborder="0"></iframe>


                <h2 id="graphsearch">Graph Search</h2>
                <img src="@/assets/images/searchbar_search_all.png" alt="searchbar" />
                <p>If you want to use the graph search, you have to use a special syntax:</p>
                <p>NodeType: AttributeOperatorValue</p>
                <p>You have two parts:</p>
                <ul>
                    <li>
                        <ul>
                            <li>This can be one of the following: genre/artist/album/song</li>
                            <li>You must write a node type</li>
                        </ul>
                    </li>
                    <li>
                        The attributes: 
                        <ul>
                            <li>This must be an attribute that exists for this nodeType</li>
                            <li>You don’t have to write an attribute</li>
                            <li>
                                Possible operators are:
                                <ul>
                                    <li>=</li>
                                    <li>!=</li>
                                    <li>&lt;</li>
                                    <li>&lt;=</li>
                                    <li>&gt;</li>
                                    <li>&gt;=</li>
                                    <li>LIKE</li>
                                </ul>
                            </li>
                            <li>
                                You can write multiple attributes (separated by a whitespace)
                                <ul>
                                    <li>These attributes act as logical AND</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>

                <h3 id="validqueries">Valid queries</h3>
                Selects all artists
                <div class="code">
                    artist
                </div>
                Selects all artists with the name U2
                <div class="code">
                    artist: name=”U2”<br>
                    artist: name=U2
                </div>
                Selects all songs which are longer than 10 seconds
                <div class="code">
                    song: duration_ms>10000<br>
                    song: duration_ms>”10000”
                </div>
                Selects all songs which are shorter than 100 seconds and longer than 10 seconds
                <div class="code">
                    song: duration_ms&gt;10000 duration_ms&lt;100000<br>
                    song: duration_ms&gt;”10000” duration_ms&lt;"100000"
                </div>
                Selects all albums that have Blues Bro in them
                <div class="code">
                    album: name LIKE “Blues Bro”<br>
                    album: name LIKE “%Blues Bro%”
                </div>
                Selects all albums that have Carly as starting word and Jepsen as end word
                <div class="code">
                    artist: name LIKE “Carly % Jepsen”
                </div>

                <h1 id="undoredo">Undo/Redo</h1>
                <p>You can undo/redo changes you did to the graph. It will revert your last graph action.</p>
                    <iframe id="ytplayer" type="text/html" width="100%" height="600"
                        src="https://www.youtube.com/embed/00RjWX0yWZc?controls=0&showinfo=0&autoplay=0&disablekb=1&fs=0&loop=1&modestbranding=0&color=white&iv_load_policy=3&playlist=00RjWX0yWZc"
                        frameborder="0"></iframe>
                

                <h1 id="user">User</h1>
                <p>You can login to out-of-tune when you click the "LOGIN" button in the top right corner. 
                    You will be redirected to a login page of Spotify. If you login successfully you will be asked if you trust us that we take certain actions:
                    You have to accept it so that out-of-tune can function correctly.</p>
                <p>We don't save any data of your Spotify account on our servers and are fully compliant with the <a href="https://developer.spotify.com/terms/">Spotify Developer terms of service</a></p>
                <h1 id="legal">Disclaimer</h1>
                <h2 id="liabilityLimitation">Limitation of liability for internal content</h2>
                <p>The content of our website has been compiled with meticulous care and to the best of our knowledge. However, we cannot assume any liability for the up-to-dateness, completeness or accuracy of any of the pages.</p>
                <h2 id="externalLinks">Limitation of liability for external links</h2>
                <p>Our website contains links to the websites of third parties („external links“). As the content of these websites is not under our control, we cannot assume any liability for such external content. In all cases, the provider of information of the linked websites is liable for the content and accuracy of the information provided. At the point in time when the links were placed, no infringements of the law were recognisable to us. As soon as an infringement of the law becomes known to us, we will immediately remove the link in question.</p>
                <h2 id="copyright">Copyright</h2>
                <p>All rights to the cover images, streamed music and all other metadata of songs, albums and artists are licenced under the <a href="https://developer.spotify.com/terms/#iii">Spotify developer terms of service</a>. The website and the webapp itself and the source code is licenced under GNU GPL3.</p>
                <h2 id="protection">Data protection</h2>
                <p>A visit to our website can result in the storage on our server of information about the access (see: <router-link to="cookiepolicy">Cookie policy</router-link>. This does not represent any analysis of personal data (e.g., name, address or e-mail address). If personal data is collected, this only occurs – to the extent possible – with the prior consent of the user of the website. Any forwarding of the data to third parties without the express consent of the user shall not take place.</p>
                <p>The use by third parties of all published contact details for the purpose of advertising is expressly excluded. We reserve the right to take legal steps in the case of the unsolicited sending of advertising information; e.g., by means of spam mail.</p>
            </div> 
            <div class="bottom">
            <div class="actions">
                <h1 class="header">General Actions</h1>
                <div class="data">
                    <template  v-for="(option, index) in actions.generalActions" v-if="!option.hidden">
                        <div :key="index">{{option.keyCombination.join(" + ")}}</div>
                        <div :key="index+'desc'">{{option.description}}</div>
                    </template>
                </div>
            </div>
            <div class="actions">
                <h1 class="header">Selection Actions</h1>
                <div class="data">
                    <template  v-for="(option, index) in actions.selectionActions" v-if="!option.hidden">
                        <div :key="index">{{option.keyCombination.join(" + ")}}</div>
                        <div :key="index+'desc'">{{option.description}}</div>
                    </template>
                </div>
            </div>
        </div>
        </div>
        

  </div>
</template>

<script>

export default {
  name: "guide",

  data: ()=>({
    actions: {
        selectionActions: {
            SHIFTLEFT: {
                keyCombination: ["SHIFT", "MOUSE0"],
                description: "selects nodes"
            },
            CTRLSHIFTLEFT: {
                keyCombination: ["CTRL", "SHIFT", "MOUSE0"],
                description: "selects nodes and adds them to current selection"
            },
            ESC: {
                keyCombination: ["ESC"],
                description: "removes selection",
            },
            DEL: {
                keyCombination: ["DEL"],
                description: "removes selected nodes"
            },
            P: {
                keyCombination: ["P"],
                description: "pins selected nodes"
            },
            U: {
                keyCombination: ["U"],
                description: "unpins selected nodes"
            },
            M: {
                keyCombination: ["M"],
                description: "activates M mode",
                hidden: true
            },
            I: {
                keyCombination: ["I"],
                description: "inverts selection"
            },
            CTRLA: {
                keyCombination: ["Ctrl", "A"],
                description: "selects all nodes"
            }
        },
        generalActions: {
            H: {
                keyCombination: ["H"],
                description: "activates highlight mode"
            },
            F: {
                keyCombination: ["F"],
                description: "fits graph to selection/screen"
            },
            SPACE: {
                keyCombination: ["SPACE"],
                description: "pauses rendering"
            },
            C: {
                keyCombination: ["C"],
                description: "applies all configurations",
                hidden: true
            }
        }
    },
    navigationData: []
  }),
  methods: {
      getName(heading) {
          return heading.attributes.id!=undefined? heading.attributes.id.value: ''
      }
  },
  mounted: function(){
    const headings = new Array(...this.$refs.help.childNodes).filter((tag)=>{
        return tag.nodeName==="H1" || tag.nodeName==="H2" || tag.nodeName==="H3" || tag.nodeName==="H4" || tag.nodeName==="H5"
    })
    this.navigationData = headings
  }
};
</script>
<style scoped>
.user-guide {
    margin-top: 64px;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 1rem;
    background-color: #000;
    color: white;
    height: 100vh;
}
.actions {
    display: grid;
    grid-template-rows: 3rem 2rem 1fr;
    grid-template-columns: 15em 1fr;
    grid-template-areas: "title title"
                         "headerleft headerright"
                         "data data";
    margin: 1rem;
    background-color: #000;

}

.headerLeft {
    grid-area: headerleft;
    text-align: center;
    padding-left: 1rem;
}
.headerRight {
    grid-area: headerright;
    text-align: center;
    padding-left: 1rem;
}
.header {
    grid-area: title;
    text-align: center;

}
.data {
    grid-area: data;
    border: 1px solid white;
    grid-template-columns: 15em 1fr;
    grid-auto-rows: 2rem;
    display: grid; 
    padding: 1rem;
    text-align: center;
    background-color: #000;

}
.help {
    padding: 4rem;
    padding-top: 1rem;
    width: 70rem;
    margin-left: auto;
    margin-right: auto;
    font-size: 1.3rem;
}
.helpWrapper {
    position: absolute;
    left: 25rem;
    width: calc(100% - 25rem);
    background: #000;

}
.navigation {
    background: #000;
    color: #1dcdda !important;
    top: 64px;
    width: 25rem;
    display:grid;
    position: fixed;
    padding: 5px;
    overflow-y: scroll;
    height: calc(100% - 64px);
    font-size: 1.3rem;
}
.h1 {
    padding-left: 1rem;
    color: #da6a1d;
    background: #222222 !important;
}
.h2 {
    padding-left: 2rem
}
.h3 {
    padding-left: 3rem
}
.h4 {
    padding-left: 4rem
}
h1 {
    color:#da6a1d!important;
    font-size: 3rem;
}
h1, h2, h3, h4, h5 {
    font-weight: 300;
    color: #1dcdda;
}
a {
    color: inherit;
    text-decoration: none;
}
a:hover {
    color: inherit;
    text-decoration: underline;
}
.navItem {
    position: sticky;
    padding-top:5px;
    padding-bottom: 5px;
    background: #333333;
    margin-top: 2px;
}
.navItem:hover {
    position: sticky;
    padding-top:5px;
    padding-bottom: 5px;
    background: #555555 !important;
    margin-top: 2px;
}
video {
    width: 100%;
}
.code {
    background: #101010;
    border: 1px solid #ddd;
    border-left: 7px solid #0d676d;
    color: #ccc;
    page-break-inside: avoid;
    font-family: monospace;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 1.6em;
    max-width: 100%;
    overflow: auto;
    padding: 1em 1.5em;
    display: block;
    word-wrap: break-word;
}
p a {
    color: #1dcdda;
}
img {
    display: block;
    margin-right: auto;
    margin-left: auto;
    max-width: 100%;
}
</style>

