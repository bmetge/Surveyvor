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
import android.view.Gravity;
import android.view.Menu;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.LinearLayout.LayoutParams;

public class CreateQuestion extends Activity implements OnItemSelectedListener, OnClickListener {
	Spinner spinner;
	String [] qnTypes = {"Question Type","Text Question","Numeric Input","Single Selection","Multiple Selection","Scale","Interval Scale","Date and time"};
    Button AddAnswer; 
    EditText MinValue,MaxValue,Resolution;
    LinearLayout AnswersPanel;
    EditText Question;

	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;
	private AlertDialog successDialog;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_question);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(CreateQuestion.this);
        
        AlertDialog.Builder builder = new AlertDialog.Builder(CreateQuestion.this);
		// Add the buttons
		builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
		           public void onClick(DialogInterface dialog, int id) {
		               // User clicked OK button
		        	   Intent intent = new Intent(CreateQuestion.this, EditQuestions.class);
		        	   intent.putExtra("surveyID", getIntent().getStringExtra("surveyID"));
				       startActivity(intent);
		           }
		       });
		successDialog = builder.create();
		
        AddAnswer = (Button)findViewById(R.id.button2);
        //AddAnswer.setOnClickListener(this);
        
        MinValue = (EditText)findViewById(R.id.editText1);
        MinValue.setOnClickListener(this);
        
        MaxValue = (EditText)findViewById(R.id.editText2);
        MinValue.setOnClickListener(this);
        
        Resolution = (EditText)findViewById(R.id.editText3);
        Resolution.setOnClickListener(this);
        
        Question = (EditText)findViewById(R.id.editText4);
        
        AnswersPanel = (LinearLayout)findViewById(R.id.answersPanel);
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(CreateQuestion.this,android.R.layout.simple_spinner_item,qnTypes);
        spinner = (Spinner) findViewById(R.id.spinner1);
        spinner.setAdapter(adapter);
        spinner.setOnItemSelectedListener(this);
        
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_create_question, menu);
        return true;
    }
    
    public void onItemSelected(AdapterView<?> arg0, View arg1, int arg2,
			long arg3) {
		
		int position = spinner.getSelectedItemPosition();
		switch(position){
		case 0:
			AnswersPanel.setVisibility(View.INVISIBLE);
			MinValue.setVisibility(View.INVISIBLE);
			MinValue.setVisibility(View.INVISIBLE);
			MaxValue.setVisibility(View.INVISIBLE);
			Resolution.setVisibility(View.INVISIBLE);
			AddAnswer.setVisibility(View.INVISIBLE);
			break;
			
		case 1:
			AnswersPanel.setVisibility(View.INVISIBLE);
			MinValue.setVisibility(View.INVISIBLE);
			MaxValue.setVisibility(View.INVISIBLE);
			Resolution.setVisibility(View.INVISIBLE);
			AddAnswer.setVisibility(View.INVISIBLE);
			break;
		case 2:
			AnswersPanel.setVisibility(View.INVISIBLE);
			MinValue.setVisibility(View.INVISIBLE);
			MaxValue.setVisibility(View.INVISIBLE);
			Resolution.setVisibility(View.INVISIBLE);
			AddAnswer.setVisibility(View.INVISIBLE);
			break;
		case 3:
			AnswersPanel.setVisibility(View.INVISIBLE);
			MinValue.setVisibility(View.INVISIBLE);
			MaxValue.setVisibility(View.INVISIBLE);
			Resolution.setVisibility(View.INVISIBLE);
			AddAnswer.setVisibility(View.INVISIBLE);
			AddAnswer.setVisibility(View.VISIBLE);
			AnswersPanel.setVisibility(View.VISIBLE);
			break;
		case 4:
			AnswersPanel.setVisibility(View.INVISIBLE);
			MinValue.setVisibility(View.INVISIBLE);
			MaxValue.setVisibility(View.INVISIBLE);
			Resolution.setVisibility(View.INVISIBLE);
			AddAnswer.setVisibility(View.VISIBLE);
			AnswersPanel.setVisibility(View.VISIBLE);
			break;
		case 5:
			AnswersPanel.setVisibility(View.INVISIBLE);
			AddAnswer.setVisibility(View.INVISIBLE);
			MinValue.setVisibility(View.VISIBLE);
			MaxValue.setVisibility(View.VISIBLE);
			Resolution.setVisibility(View.VISIBLE);
			break;
		case 6:
			AnswersPanel.setVisibility(View.INVISIBLE);
			MinValue.setVisibility(View.INVISIBLE);
			MaxValue.setVisibility(View.INVISIBLE);
			Resolution.setVisibility(View.INVISIBLE);
			AddAnswer.setVisibility(View.VISIBLE);
			AnswersPanel.setVisibility(View.VISIBLE);
			break;
		case 7:
			AnswersPanel.setVisibility(View.INVISIBLE);
			MinValue.setVisibility(View.INVISIBLE);
			MaxValue.setVisibility(View.INVISIBLE);
			Resolution.setVisibility(View.INVISIBLE);
			AddAnswer.setVisibility(View.INVISIBLE);
			break;
		}
		// TODO Auto-generated method stub
		
		
	}
	public void onNothingSelected(AdapterView<?> arg0) {
		// TODO Auto-generated method stub
		
	}
	public void onClick(View arg0) {
		// TODO Auto-generated method stub
		
	}
	
	public void onClickAddAnswer(View view){
		LinearLayout answerAndRemove = new LinearLayout(this);
		LinearLayout answersPanel = (LinearLayout) findViewById(R.id.answersPanel);
	    EditText editTextView = new EditText(this);
	    editTextView.setGravity(Gravity.CENTER);
	    editTextView.setHint("Type answer");
	    answerAndRemove.setOrientation(LinearLayout.HORIZONTAL);
	    
	    Button removeBtn = new Button(this);
	    removeBtn.setText("Remove");
	    removeBtn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                // Perform action on click
            	LinearLayout ll = (LinearLayout)(v.getParent());
            	((LinearLayout)ll.getParent()).removeView(ll);
            }
        });
	   
	    LayoutParams params = new LayoutParams(LayoutParams.WRAP_CONTENT,
	        LayoutParams.WRAP_CONTENT, 1);

	    editTextView.setLayoutParams(params);
	    answerAndRemove.addView(editTextView);
	    answerAndRemove.addView(removeBtn, params);
	    answersPanel.addView(answerAndRemove);
	}

	
	public void onClickSave(View view){
		String question = Question.getText().toString();
		int position = spinner.getSelectedItemPosition();
		int questionType = position;
		StringBuffer answers = new StringBuffer() ;
		//StringBuffer answerIDs = new StringBuffer();
		EditText answer;
		SaveTask saveTask = new SaveTask();
		
		switch(position){
			case 3:
			case 4:
			case 6:
				for (int i = 0; i < AnswersPanel.getChildCount(); i++){ 
					 answer = (EditText)(((LinearLayout)(AnswersPanel.getChildAt(i))).getChildAt(0))  ;
					 answers.append(answer.getText().toString()+"|");	 
				}
				if(answers.length()>0)
					answers.deleteCharAt(answers.length()-1); // delete last '|' character
				saveTask.execute("surveymanagement/edit_survey/", "surveyId=" + getIntent().getStringExtra("surveyID") + "&text_label=" + answers.toString() + "&new_name=" + "&new_type=" +"&text=" + question + "&type=" + questionType);
				break;
			case 1:
			case 2:
			case 7:
				saveTask.execute("surveymanagement/edit_survey/", "surveyId=" + getIntent().getStringExtra("surveyID") + "&new_name=" + "&new_type=" +"&text=" + question + "&type=" + questionType);
				break;
			case 5:
				saveTask.execute("surveymanagement/edit_survey/", "surveyId=" + getIntent().getStringExtra("surveyID") + "&new_name=" + "&new_type=" +"&text=" + question + "&type=" + questionType + "&val_max=" + MaxValue.getText().toString() + "&val_min=" + MinValue.getText().toString() + "&resolution=" + Resolution.getText().toString());
				break;
			case 0:
				alertDialog.setMessage("Please select a question type!");
				alertDialog.show();
				break;
		}
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
				
				if(! object.getBoolean("question_added")){
					alertDialog.setMessage("Could not add question.");
					alertDialog.show();
				}
				else{
					successDialog.setMessage("Question added!");
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
