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
import android.content.Intent;
import android.view.ContextMenu;
import android.view.ContextMenu.ContextMenuInfo;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView.AdapterContextMenuInfo;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;


public class EditQuestions extends Activity implements AdapterView.OnItemClickListener {
	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;
	private SurveyQuestion[] questions;
	private TextView noQuestions;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_questions);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(EditQuestions.this);
        noQuestions = (TextView)findViewById(R.id.textView1);
        GetQuestionsTask getQuestionsTask = new GetQuestionsTask();
        getQuestionsTask.execute("surveymanagement/check_survey/", "surveyId=" + getIntent().getStringExtra("surveyID"));

    }
    
    @Override
    public void onCreateContextMenu(ContextMenu menu, View v,
                                    ContextMenuInfo menuInfo) {
        super.onCreateContextMenu(menu, v, menuInfo);
        //MenuInflater inflater = getMenuInflater();
        //inflater.inflate(R.menu.context_menu, menu);
        
        menu.add(Menu.NONE, 2, 2, "Edit Question");
        menu.add(Menu.NONE, 3, 3, "Remove");

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_edit_questions, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.add:
            	Intent intent = new Intent(this, CreateQuestion.class);
            	intent.putExtra("surveyID", getIntent().getStringExtra("surveyID"));
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

	public void onItemClick(AdapterView<?> arg0, View arg1, int arg2, long arg3) {
		// TODO Auto-generated method stub
		arg0.showContextMenuForChild(arg1); 
		
	}
	
    @Override
    public boolean onContextItemSelected(MenuItem item) {
        AdapterContextMenuInfo info = (AdapterContextMenuInfo) item.getMenuInfo();
        JSONObject object;
        String questionID = "";
    	
    	try{    	
			object = (JSONObject) new JSONTokener(questions[(int)info.id].questionJSON).nextValue();
			questionID = object.getString("pk"); 
    	}catch (JSONException e) {
				// TODO Auto-generated catch block
			e.printStackTrace();
		}
        switch (item.getItemId()) {
            case 2: // Edit
            	Intent intent2 = new Intent(this, Question.class);
            	intent2.putExtra("surveyID", getIntent().getStringExtra("surveyID"));
                intent2.putExtra("questionID", questionID);
                startActivity(intent2);
                return true;
            case 3: // Remove
               	RemoveQuestionTask removeQuestionTask = new RemoveQuestionTask();
            	removeQuestionTask.execute("surveymanagement/delete_question/", "questionId=" + questionID);
            	return true;
            	
            default:
                return super.onContextItemSelected(item);
        }
    }
    
  
    private class GetQuestionsTask extends AsyncTask<String, Void, String> {

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
            progressDialog.setMessage("Fetching questions...");
            progressDialog.show();
        }
    	
    	protected void onPostExecute(String jsonString) {
    		try {
				JSONArray questionsJSON = new JSONArray(jsonString);
				questions = new SurveyQuestion[questionsJSON.length()];
				
				for(int i=0; i<questionsJSON.length(); i++){
					questions[i] = new SurveyQuestion();
					questions[i].questionJSON = questionsJSON.getString(i);
				}
				
		        ArrayAdapter<SurveyQuestion> adapterQuestions = new ArrayAdapter<SurveyQuestion>(EditQuestions.this, 
		                android.R.layout.simple_list_item_1, questions);
		        ListView listView1 = (ListView) findViewById(R.id.listView1);
		        listView1.setAdapter(adapterQuestions);
		        
		        listView1.setOnItemClickListener(EditQuestions.this);
		        registerForContextMenu(listView1);
		        
		        if(questionsJSON.length()==0)
		        	noQuestions.setVisibility(View.VISIBLE);
			
		        progressDialog.dismiss();
			} catch (JSONException e) {
				 //TODO Auto-generated catch block
				e.printStackTrace();
			}
    		
        }

    	
    }
    

    private class SurveyQuestion{
    	String questionJSON; // survey in JSON format
    	
    	@Override
    	public String toString(){
    		try{
    			JSONObject object = (JSONObject) new JSONTokener(questionJSON).nextValue();
    			return "Question " + object.getJSONObject("fields").getString("questionNumber");
    		}
    		catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
    		return null;
    	}
    }
    

    private class RemoveQuestionTask extends AsyncTask<String, Void, String> {

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
            progressDialog.setMessage("Removing Question...");
            progressDialog.show();
        }
    	
    	protected void onPostExecute(String jsonString) {
        	JSONObject object;
			try {
				object = (JSONObject) new JSONTokener(jsonString).nextValue();
			
				if(object.getBoolean("question_not_exist")){
					alertDialog.setMessage("Error. The question does not exist!");
					alertDialog.show();
				}
				else{
					Intent intent = new Intent(EditQuestions.this, EditQuestions.class);
					intent.putExtra("surveyID", EditQuestions.this.getIntent().getStringExtra("surveyID"));
			        startActivity(intent);
				}
				progressDialog.dismiss();
				
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }
    

}
