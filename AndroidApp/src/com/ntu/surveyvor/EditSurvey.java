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
import android.widget.TextView;
import android.support.v4.app.NavUtils;

public class EditSurvey extends Activity {
	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_survey);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(EditSurvey.this);
        GetSurveyTask getSurveyTask = new GetSurveyTask();
        String surveyID = getIntent().getStringExtra("surveyID");
        getSurveyTask.execute("surveymanagement/get_survey/", "surveyId="+surveyID);
        
                
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_edit_survey, menu);
        return true;
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
    
    public void onClickSave(View v) {
    	SaveTask task = new SaveTask();
    	EditText surveyName= (EditText) findViewById(R.id.editText1);
    	RadioGroup g = (RadioGroup) findViewById(R.id.radioGroup1); 
   	 	
    	// Returns an integer which represents the selected radio button's ID
    	int selected = g.getCheckedRadioButtonId();
    	 
    	// Gets a reference to our "selected" radio button
    	RadioButton surveyType = (RadioButton) findViewById(selected);
    	Intent intent = getIntent();
        String surveyID = intent.getStringExtra("surveyID");
        
		task.execute("surveymanagement/edit_survey/", "surveyId="+surveyID+"&new_name="+surveyName.getText().toString()+ "&new_type="+surveyType.getText().toString());

    }
    public void onClickEditQuestions(View v){
    	Intent intent = new Intent(EditSurvey.this, EditQuestions.class);
    	intent.putExtra("surveyID", getIntent().getStringExtra("surveyID"));
        startActivity(intent);
    }

    private class SaveTask extends AsyncTask<String, Void, String> {

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
				
				if(object.getBoolean("survey_not_exist")){
					alertDialog.setMessage("Error. Survey does not exist!");
					alertDialog.show();
				}
				else if(object.getBoolean("surveyname_already_taken")){
					alertDialog.setMessage("A survey with the same name already exists!");
					alertDialog.show();
				}
				else{
					Intent intent = new Intent(EditSurvey.this, Profile.class);
			        startActivity(intent);
				}
				progressDialog.dismiss();
				
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }
    

    private class GetSurveyTask extends AsyncTask<String, Void, String> {

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
            progressDialog.setMessage("Loading survey...");
            progressDialog.show();
        }
    	
    	protected void onPostExecute(String jsonString) {
            String surveyID = getIntent().getStringExtra("surveyID");
            
        	EditText surveyName= (EditText) findViewById(R.id.editText1); 
        	RadioGroup g = (RadioGroup) findViewById(R.id.radioGroup1); 
        	
        	JSONObject object;
			try {
				object = (JSONObject) new JSONTokener(jsonString).nextValue();
			
				if(object.getString("survey_name")==null || object.getString("survey_name").length()==0 || object.getString("survey_name")==null || object.getString("survey_type").length()==0){
					alertDialog.setMessage("Failed!");
					alertDialog.show();
				}
				else{
					surveyName.setText(object.getString("survey_name"));
					if(object.getString("survey_type").equals("quiz"))
						g.check(R.id.radio0); 
					else 
						g.check(R.id.radio1);
				}
				progressDialog.dismiss();
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }

}
