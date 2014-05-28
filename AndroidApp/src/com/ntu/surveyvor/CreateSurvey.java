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
import android.content.Intent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.EditText;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.support.v4.app.NavUtils;

public class CreateSurvey extends Activity {
	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_survey);
        //getActionBar().setDisplayHomeAsUpEnabled(true);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(this);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_create_survey, menu);
        return true;
    }

    public void onClickCreate(View v) {
    	CreateTask task = new CreateTask();
    	EditText surveyname= (EditText) findViewById(R.id.editText1);
    	RadioGroup g = (RadioGroup) findViewById(R.id.radioGroup1); 
    	 
    	// Returns an integer which represents the selected radio button's ID
    	int selected = g.getCheckedRadioButtonId();
    	 
    	// Gets a reference to our "selected" radio button
    	RadioButton surveytype = (RadioButton) findViewById(selected);
    	if(surveyname.getText().toString().length()==0){
			surveyname.setError("Survey Name is required!");
		}
    	else
    		task.execute("surveymanagement/create_survey/", "surveyname="+surveyname.getText().toString()+"&surveytype="+surveytype.getText().toString().toLowerCase());

    }
    

    private class CreateTask extends AsyncTask<String, Void, String> {

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
			
				if(object.getBoolean("surveyname_already_taken")){
					alertDialog.setMessage("A survey with the same name already exists!");
					alertDialog.show();
				}
				else{
					Intent intent = new Intent(CreateSurvey.this, Profile.class);
			        startActivity(intent);
				}
				progressDialog.dismiss();

				
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                NavUtils.navigateUpFromSameTask(this);
                return true;
        }
        return super.onOptionsItemSelected(item);
    }

}
