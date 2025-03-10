export default class kanBanApi{
    static getItem(colID){
        const column = read().find(col => col.id == colID);

        if(!column){
            return [];
        }

        return column.items;
    }

    static addItem(colId , content){
        const data = read();
        const column = data.find(col => col.id == colId);
        const item = {
            id: Date.now(),
            content: content,
        }
        if(!column){
            throw console.error(404, "Column not found");
            
        }

        column.items.push(item);
        save(data);
    }

    static updateItem(itemId ,newProps){
        const data = read();
        const [item,currentColumn] = (() => {
            for(const column of data){
                    const item = column.items.find(item => item.id == itemId);
                    if(item){
                        return [item, column]
                    } 

            }
        })();

        if(!item){
            throw console.error(404, "Item not found");
        }

        item.content = newProps.content === undefined ? item.content : newProps.content;
        // console.log(newProps);
        
        if(newProps.content !== undefined && newProps.position !== undefined){
            const targetColumn = data.find( col => col.id == newProps.columnID)
            if(!targetColumn){
                throw console.error(404, "Column not found");
            }
           currentColumn.items.splice(currentColumn.items.indexOf(item),1);

           targetColumn.items.splice(newProps.position,0,item)
        }
        save(data);
        
        // console.log(item, currentColumn);
    }
    static deleteItem(itemId) {
        const data = read();

        for (const column of data) {
            const itemIndex = column.items.findIndex(item => item.id == itemId);
            if (itemIndex !== -1) {
                column.items.splice(itemIndex, 1); 
                save(data);
                return;
            }
        }

        throw new Error("Item not found");
    }
}

function read(){
    const data = localStorage.getItem('kanban-data');
    if(!data){
        return [
            {
                id: 1,
                items: [
                    { id: 101, content: "Design project wireframe" },
                    { id: 102, content: "Research UI components" }
                ]
            },
            {
                id: 2,
                items: [
                    { id: 201, content: "Develop authentication system" },
                    { id: 202, content: "Implement drag & drop feature" }
                ]
            },
            {
                id: 3,
                items: [
                    { id: 301, content: "Test responsiveness on mobile" },
                    { id: 302, content: "Fix UI bugs" }
                ]
            }
        ]
    }

    return JSON.parse(data);
}

function save(data){
    localStorage.setItem('kanban-data', JSON.stringify(data));
}

echo "# Kanban-Board" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git push -u origin main