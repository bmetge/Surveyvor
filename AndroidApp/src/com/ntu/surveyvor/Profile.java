package com.ntu.surveyvor;

import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.view.ContextMenu;
import android.view.ContextMenu.ContextMenuInfo;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView.AdapterContextMenuInfo;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TabHost;
import android.widget.TabHost.TabSpec;
import android.widget.AdapterView;
import android.widget.TextView;

public class Profile extends Activity implements AdapterView.OnItemClickListener {
	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;
	private AlertDialog successDialog;
	private TabHost tabHost;
	Survey[] publishedSurveys;
	Survey[] unpublishedSurveys;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(Profile.this);
        
        AlertDialog.Builder builder = new AlertDialog.Builder(Profile.this);
		// Add the buttons
		builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
		           public void onClick(DialogInterface dialog, int id) {
		               // User clicked OK button
		        	   Intent intent = new Intent(Profile.this, Profile.class);
				        startActivity(intent);
		           }
		       });
		successDialog = builder.create();
        tabHost=(TabHost)findViewById(android.R.id.tabhost);
        tabHost.setup();

        TabSpec spec1=tabHost.newTabSpec("Published");
        spec1.setContent(R.id.listView1);
        spec1.setIndicator("Published");

        TabSpec spec2=tabHost.newTabSpec("Unpublished");
        spec2.setIndicator("Unpublished");
        spec2.setContent(R.id.listView2);

        tabHost.addTab(spec1);
        tabHost.addTab(spec2);

    	GetPublishedSurveysTask getPublishedSurveysTask = new GetPublishedSurveysTask();
		getPublishedSurveysTask.execute();
	
    	GetUnpublishedSurveysTask getUnpublishedSurveysTask = new GetUnpublishedSurveysTask();
		getUnpublishedSurveysTask.execute();
		
    }
    
    @Override
    public void onCreateContextMenu(ContextMenu menu, View v,
                                    ContextMenuInfo menuInfo) {
        super.onCreateContextMenu(menu, v, menuInfo);
        AdapterContextMenuInfo info = (AdapterContextMenuInfo) menuInfo;
        //MenuInflater inflater = getMenuInflater();
        //inflater.inflate(R.menu.context_menu, menu);
        //menu.add(Menu.NONE, 1, 1, "Preview");
        menu.add(Menu.NONE, 2, 2, "Edit");
        menu.add(Menu.NONE, 3, 3, "Remove");
        if(v.equals((ListView) findViewById(R.id.listView1))){
        	//menu.add(Menu.NONE, 4, 4, "Analyze Results");
        	//if(publishedSurveys[info.position].)
        	//menu.add(Menu.NONE, 5, 5, "Close Survey");
        	menu.add(Menu.NONE, 7, 7, "Send Survey");
        }
        if(v.equals((ListView) findViewById(R.id.listView2)))
        	menu.add(Menu.NONE, 6, 6, "Publish");
        
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_profile, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.create:
            	Intent intent = new Intent(this, CreateSurvey.class);
                startActivity(intent);
                return true;
            case R.id.manageAccount:
            	Intent intent2 = new Intent(this, ManageAccount.class);
                startActivity(intent2);
                return true;
            case R.id.logout:
            	LogoutTask logoutTask = new LogoutTask();
        		logoutTask.execute();
            default:
                return super.onOptionsItemSelected(item);
        }
    }
    
    @Override
    public boolean onContextItemSelected(MenuItem item) {
        AdapterContextMenuInfo info = (AdapterContextMenuInfo) item.getMenuInfo();
        JSONObject object;
        String surveyID = "";
    	
    	try{
        	if(tabHost.getCurrentTab()==0){
				object = (JSONObject) new JSONTokener(publishedSurveys[(int)info.id].surveyJSON).nextValue();
				surveyID = object.getString("pk");
            	
				}
          	else{
				object = (JSONObject) new JSONTokener(unpublishedSurveys[(int)info.id].surveyJSON).nextValue();
				surveyID = object.getString("pk");
            	
			} 
    	}catch (JSONException e) {
				// TODO Auto-generated catch block
			e.printStackTrace();
		}
        switch (item.getItemId()) {
            /*case 1: // Preview
            	Intent intent = new Intent(this, PreviewSurvey.class);
            	// NOTE : We should get the survey ID in the JSON from the server and set the survey ID dynamically while populating the survey list
                intent.putExtra("surveyID", surveyID);
                startActivity(intent);
                return true;
                */
            case 2: // Edit
            	Intent intent2 = new Intent(this, EditSurvey.class);
                intent2.putExtra("surveyID", surveyID);
                startActivity(intent2);
                return true;
            case 3: // Remove
            	RemoveSurveyTask removeSurveyTask = new RemoveSurveyTask();
            	removeSurveyTask.execute("surveymanagement/delete_survey/", "surveyId=" + surveyID);
            	
            	return true;
           // case 5: // Close
           // 	CloseSurveyTask closeSurveyTask = new CloseSurveyTask();
           // 	closeSurveyTask.execute("surveymanagement/close_survey/", "surveyId=" + surveyID);
           // 	return true;
            case 6:
            	PublishSurveyTask publishSurveyTask = new PublishSurveyTask();
            	publishSurveyTask.execute("surveymanagement/publish_survey/", "surveyId=" + surveyID);
            	return true;
            case 7:
            	Intent intent3 = new Intent(this, SendSurvey.class);
                intent3.putExtra("surveyID", surveyID);
                startActivity(intent3);
                return true;
            default:
                return super.onContextItemSelected(item);
        }
    }

    
    private class GetPublishedSurveysTask extends AsyncTask<String, Void, String> {

    	@Override
    	protected String doInBackground(String... params) {
    		try {
    			return ServerComm.getJsonWithGet("surveymanagement/get_published_surveys");
    		} catch (IOException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    			return null;
    		}
    	}
    	
    	@Override
        protected void onPreExecute()
        {
            progressDialog.setMessage("Fetching surveys...");
            progressDialog.show();
        }
    	
    	protected void onPostExecute(String jsonString) {
    		try {
				JSONArray publishedSurveysJSON = new JSONArray(jsonString);
				publishedSurveys = new Survey[publishedSurveysJSON.length()];
				for(int i=0; i<publishedSurveysJSON.length(); i++){
					publishedSurveys[i] = new Survey();
					publishedSurveys[i].surveyJSON = publishedSurveysJSON.getString(i);
				}
				
		        ArrayAdapter<Survey> adapterPublished = new ArrayAdapter<Survey>(Profile.this, 
		                android.R.layout.simple_list_item_1, publishedSurveys);
		        ListView listView1 = (ListView) findViewById(R.id.listView1);
		        listView1.setAdapter(adapterPublished);
		        
		        listView1.setOnItemClickListener(Profile.this);
		        registerForContextMenu(listView1);
			
	        
			} catch (JSONException e) {
				 //TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    	
    }
    

    private class RemoveSurveyTask extends AsyncTask<String, Void, String> {

    	@Override
    	protected String doInBackground(String... params) {
    		String relativeUrl = params[0];
    		String postQuery = params[1];
    		try {
    			return ServerComm.getJsonWithPost(relativeUrl, postQuery);
    		} catch (IOException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    			return null;
    		}
    	}
    	
    	@Override
        protected void onPreExecute()
        {
            progressDialog.setMessage("Removing Survey...");
            progressDialog.show();
        }
    	
    	protected void onPostExecute(String jsonString) {
        	JSONObject object;
			try {
				object = (JSONObject) new JSONTokener(jsonString).nextValue();
			
				if(object.getBoolean("survey_not_exist")){
					alertDialog.setMessage("Error. The survey does not exist!");
					alertDialog.show();
				}
				else{
					Intent intent = new Intent(Profile.this, Profile.class);
			        startActivity(intent);
				}
				progressDialog.dismiss();
				
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }
    
    
    private class GetUnpublishedSurveysTask extends AsyncTask<String, Void, String> {

    	@Override
    	protected String doInBackground(String... params) {
    		try {
    			return ServerComm.getJsonWithGet("surveymanagement/get_unpublished_surveys");
    		} catch (IOException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    			return null;
    		}
    	}
    	
       	
    	protected void onPostExecute(String jsonString) {
        	
			try {
				JSONArray unpublishedSurveysJSON = new JSONArray(jsonString);
				unpublishedSurveys = new Survey[unpublishedSurveysJSON.length()];
				
				for(int i=0; i<unpublishedSurveysJSON.length(); i++){
					unpublishedSurveys[i] = new Survey();
					unpublishedSurveys[i].surveyJSON = unpublishedSurveysJSON.getString(i);
				}
				
		        ArrayAdapter<Survey> adapterUnpublished = new ArrayAdapter<Survey>(Profile.this, 
		                android.R.layout.simple_list_item_1, unpublishedSurveys);
		        ListView listView2 = (ListView) findViewById(R.id.listView2);
		        listView2.setAdapter(adapterUnpublished);
		        
		        listView2.setOnItemClickListener(Profile.this);
		        registerForContextMenu(listView2);
		        progressDialog.dismiss();
	        
			} catch (JSONException e) {
				 //TODO Auto-generated catch block
				e.printStackTrace();
			}
			
        }
    	
    	
    }
    
    private class Survey{
    	String surveyJSON; // survey in JSON format
    	
    	@Override
    	public String toString(){
    		try{
    			JSONObject object = (JSONObject) new JSONTokener(surveyJSON).nextValue();
    			return object.getJSONObject("fields").getString("name");
    		}
    		catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
    		return null;
    	}
    }


	public void onItemClick(AdapterView<?> arg0, View arg1, int arg2, long arg3) {
		// TODO Auto-generated method stub
		arg0.showContextMenuForChild(arg1); 
		
	}
	

	private class LogoutTask extends AsyncTask<String, Void, String> {

		@Override
		protected String doInBackground(String... params) {
			
			try {
				return ServerComm.getJsonWithGet("account/logout");
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return null;
			}
		}
		
    	@Override
        protected void onPreExecute()
        {
            progressDialog.setMessage("Logging out...");
            progressDialog.show();
        }
    	
		protected void onPostExecute(String jsonString) {
			alertDialog.setTitle("Logout");
	    	JSONObject object;
			try {
				object = (JSONObject) new JSONTokener(jsonString).nextValue();
				if(object.getString("logout_success").equals("failure")){
					
					alertDialog.setMessage("Failure !");
					alertDialog.show();
				}
				else{
					Intent intent = new Intent(Profile.this, LoginActivity.class);
			        startActivity(intent);
				}
			}catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	    }
	
	}
	

    private class CloseSurveyTask extends AsyncTask<String, Void, String> {

    	@Override
    	protected String doInBackground(String... params) {
    		String relativeUrl = params[0];
    		String postQuery = params[1];
    		try {
    			return ServerComm.getJsonWithPost(relativeUrl, postQuery);
    		} catch (IOException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    			return null;
    		}
    	}
    	
    	@Override
        protected void onPreExecute()
        {
            progressDialog.setMessage("Please wait...");
            progressDialog.show();
        }
    	
    	
    	protected void onPostExecute(String jsonString) {
        	JSONObject object;
			try {
				object = (JSONObject) new JSONTokener(jsonString).nextValue();
			
				if(! object.getBoolean("survey_closed")){
					alertDialog.setMessage("Survey could not be closed");
					alertDialog.show();
				}
				else{
					successDialog.setMessage("Survey Closed.");
					successDialog.show();
				}
			progressDialog.dismiss();
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }

    private class PublishSurveyTask extends AsyncTask<String, Void, String> {

    	@Override
    	protected String doInBackground(String... params) {
    		String relativeUrl = params[0];
    		String postQuery = params[1];
    		try {
    			return ServerComm.getJsonWithPost(relativeUrl, postQuery);
    		} catch (IOException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    			return null;
    		}
    	}
    	
    	@Override
        protected void onPreExecute()
        {
            progressDialog.setMessage("Please wait...");
            progressDialog.show();
        }
    	
    	
    	protected void onPostExecute(String jsonString) {
        	JSONObject object;
        	progressDialog.dismiss();
			try {
				object = (JSONObject) new JSONTokener(jsonString).nextValue();
			
				
					successDialog.setMessage("Survey published!");
					successDialog.show();
				
			
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }


}
