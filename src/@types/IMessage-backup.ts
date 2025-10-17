     type mysqlConfig = {
        host:string,
        porta:string,
        usuario:string,
        senha:string
    }

export interface Messagebackup {
     codigo: number, 
     config: mysqlConfig,
      databaseName:string ,
      pathZip: string 
      databases:string[] 
}