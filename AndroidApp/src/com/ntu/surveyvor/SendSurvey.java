package com.ntu.surveyvor;

import java.io.IOException;

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
import android.view.Menu;
import android.view.View;
import android.widget.EditText;

public class SendSurvey extends Activity {

	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;
	private AlertDialog successDialog; 
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_send_survey);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(SendSurvey.this);
        AlertDialog.Builder builder = new AlertDialog.Builder(SendSurvey.this);
		// Add the buttons
		builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
		           public void onClick(DialogInterface dialog, int id) {
		               // User clicked OK button
		        	   Intent intent = new Intent(SendSurvey.this, Profile.class);
				        startActivity(intent);
		           }
		       });
		successDialog = builder.create();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_send_survey, menu);
        return true;
    }
    
    public void onClickSend(View v) {
    	SendTask task = new SendTask();
    	EditText email = (EditText) findViewById(R.id.email);
    	EditText name = (EditText) findViewById(R.id.name);
		task.execute("surveymanagement/send_survey/", "surveyId="+ getIntent().getStringExtra("surveyID") + "&respondent_name="+ name.getText().toString() + "&email="+ email.getText().toString());

    }
    
    
    private class SendTask extends AsyncTask<String, Void, String> {

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
			
				if(! object.getBoolean("survey_send")){
					alertDialog.setMessage("The survey could not be sent!");
					alertDialog.show();
				}
				else{
					successDialog.setMessage("The survey has been successfully sent!");
					successDialog.show();
				}
				progressDialog.dismiss();
				
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }

}
