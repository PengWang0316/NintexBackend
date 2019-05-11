# In SharePoint Online you must be site collection administrator to access all the subsites 
# Even you are SPAdmin/GlobalAdmin you may not get access to all the sites/subsites  
 
Add-Type -Path "C:\Windows\Microsoft.NET\assembly\GAC_MSIL\Microsoft.SharePoint.Client\v4.0_15.0.0.0__71e9bce111e9429c\Microsoft.SharePoint.Client.dll"   
Add-Type -Path "C:\Windows\Microsoft.NET\assembly\GAC_MSIL\Microsoft.SharePoint.Client.Runtime\v4.0_15.0.0.0__71e9bce111e9429c\Microsoft.SharePoint.Client.Runtime.dll" 
Add-Type -Path "C:\Program Files\SharePoint Client Components\Assemblies\Microsoft.Online.SharePoint.Client.Tenant.dll"  
 
$orgName = "ntxte08"
$admin = "eharris@ntxte08.com"
$password = ConvertTo-SecureString "Nintex2015!" -AsPlainText -Force
$adminUrl = "https://$orgName-admin.sharepoint.com"
$credentials = New-Object Microsoft.SharePoint.Client.SharePointOnlineCredentials($admin, $password)
 
 
Function GetWorkflowsInEachWeb ($siteCollectionUrl, $url, $OutputFile) 
{ 
    try { 
        $ctx = New-Object Microsoft.SharePoint.Client.ClientContext($url)  
        $ctx.Credentials = $credentials 
        $web = $ctx.Web  
        $ctx.Load($web)      
        $ctx.Load($web.Webs) 
        $ctx.Load($web.Lists)     
        $ctx.ExecuteQuery() 
     
        $record = "$($web.Id),`"$($web.Url)`",`"$($web.Title)`"," 
         
        foreach($list in $web.Lists) {
            # Write-host "Checking list: " + $list     
            $ctx.Load($list.WorkflowAssociations)     
            $ctx.ExecuteQuery() 
            $i = 0 
            foreach($wfAssociation in $list.WorkflowAssociations) {  
                if($i -ne 0) { $record = ",,," } 
                $record += "`"$($list.Title)`",`"$($wfAssociation.Name)`",`"$($wfAssociation.TaskListTitle)`","  
                $record += "`"$($wfAssociation.HistoryListTitle)`",$($wfAssociation.Created),$($wfAssociation.Modified)"
                Write-host $record
                Add-Content $OutputFile $record 
                $i++ 
            }  
        } 
 
        foreach($subweb in $web.Webs) {         
            GetWorkflowsInEachWeb $siteCollectionUrl $subweb.Url $OutputFile 
        } 
    } 
    catch { Write-Host "Access Denied" } 
} 
 
 
Function GetAllWorkflows($OutputFile)  
{  
    #Write CSV separated file header  
    Set-Content $OutputFile "WebId,Url,Name,ListTitle,WorkflowName,TaskList,HistoryList,Created,Modified" 
 
    $t_ctx = New-Object Microsoft.SharePoint.Client.ClientContext($adminUrl) 
    $t_ctx.Credentials = $credentials 
    $tenant = New-Object Microsoft.Online.SharePoint.TenantAdministration.Tenant($t_ctx) 
    $props = $tenant.GetSiteProperties(0, $true) 
    $t_ctx.Load($props) 
    $t_ctx.ExecuteQuery() 
    #if you want to limit to a specific site collection. 
    #$props = $props | ? {$_.Url -eq "<your site collection url here>"} 
    foreach($prop in $props) {         
       GetWorkflowsInEachWeb $prop.Url $prop.Url $OutputFile 
    } 
} 
 
GetAllWorkflows "C:\Temp\SPO-AllWorkflows.csv"