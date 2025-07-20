1. Elaborate on Core Structure, how does it work for a website like instagram?
https://claude.ai/share/438c6ef3-ecdf-41d2-95ea-d2e21e02f00d




**ADDITIONAL INSTRUCTIONS**
1. When asked to create or modify a page, DO NOT ATTEMPT TO MANUALLY REBUILD INDEX.HTML
2. Always sequentially think through your response before proceeding. If you are unsure of anything or there are multiple options, ask me clarification questions
3. Design your content to be optimised for a mobile phone form factor e.g. vertical display, scrolling etc2
4. When using the 'file system' MCP, always attempt to EDIT THE FILE. Only use WRITE FILE command if you cannot EDIT.


**DEFINITIONS**
1. File Pattern - refers to the sequential ordering of pages (e.g. page1, page2, page3, etc) contained within C:\DEV\Project IO MVP\content

**SPECIFIC COMMANDS**
Whenever I ask you to **[create page]**, this is what I want you to do:
1. Look at the prompt text after **[create page]** and come up with a chinese phrase or word or 成语 that best reflects what the user has put into the prompt. Let's define this new chinese phrase or word or 成语 youve come up with as **[THE WORD]**
2. Create a new entry in "C:\DEV\Project IO MVP\data\pages.json" that follows the sequential order and format of the previous entries in the file.
3. After that, I want you to update the "quote"with a poetic english quote that creatively relates to **[THE WORD]**, but is a mix of both eastern and western ideals
5. after that, update the "backgroundImage" by searcing online for a relevant image with the following critieria:
5.1 Reading the new page's content created above i.e. (**[THE WORD]** + quote)
5.2 Generate relevant search terms based on the meaning
5.3 Find appropriate images from free online sources
5.4 check that the URL works, if it doesnt, repeat step 3
5.5 Update the "backgroundImage" with this URL