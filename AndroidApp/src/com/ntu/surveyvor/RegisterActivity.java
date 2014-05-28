package com.ntu.surveyvor;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import android.widget.CheckBox;
import android.widget.EditText;

public class RegisterActivity extends Activity {

	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;
	private AlertDialog successDialog; 
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(RegisterActivity.this);
        AlertDialog.Builder builder = new AlertDialog.Builder(RegisterActivity.this);
		// Add the buttons
		builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
		           public void onClick(DialogInterface dialog, int id) {
		               // User clicked OK button
		        	   Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
				        startActivity(intent);
		           }
		       });
		successDialog = builder.create();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_register, menu);
        return true;
    }
    

    public void onClickRegister(View v) {
    	RegisterTask task = new RegisterTask();
    	EditText username= (EditText) findViewById(R.id.editText1);
    	EditText password = (EditText) findViewById(R.id.editText2);
    	EditText retypedPassword = (EditText) findViewById(R.id.editText3);
    	EditText email = (EditText) findViewById(R.id.editText4);
    	Boolean checked = ((CheckBox) findViewById(R.id.checkBox1)).isChecked();
    	Pattern pattern = Pattern.compile("^(?=.*[0-9])(?=.*[A-Z]).{8,}$");
    	Matcher matcher = pattern.matcher(password.getText().toString().toUpperCase());
    	
    	boolean passed = true; 
    	if (username.getText().toString().length()==0){
    		username.setError("Username is required!");
    		passed = false;
    	}
    	if (password.getText().toString().length()==0){
    		password.setError("Password is required!");
    		passed = false;
    	}
    	else if( ! matcher.matches() ){
    		password.setError("Password must be at least 8 characters long and must contain 1 letter and 1 number");
    		passed = false;
    	}
    	if (retypedPassword.getText().toString().length()==0){
    		retypedPassword.setError("Retyped Password required!");
    		passed = false;
    	}
    	else if( ! password.getText().toString().equals(retypedPassword.getText().toString()) ){
    		retypedPassword.setError("Passwords do not match! Please check that you have retyped correctly.");
    		passed = false;
    	}
    	if (email.getText().toString().length()==0){
    		email.setError("Email required!");
    		passed = false;
    	}
    	
    	if(passed && !checked){
    		alertDialog.setMessage("You must accept the Terms and Conditions to register.");
    		alertDialog.show();
    	}   		
    	else if( passed && checked ){
    		task.execute("account/register/", "username="+username.getText().toString()+"&password="+password.getText().toString()+"&email="+email.getText().toString());
    	}

    }
   
    
    private class RegisterTask extends AsyncTask<String, Void, String> {

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
			
				if(object.getBoolean("invalid_email")){
					alertDialog.setMessage("Email is invalid!");
					alertDialog.show();
				}
				else if(object.getBoolean("username_already_taken")){
					alertDialog.setMessage("Username is already taken!");
					alertDialog.show();
				}
				else if(object.getBoolean("email_already_taken")){
					alertDialog.setMessage("An account with this email already exists!");
					alertDialog.show();
				}
				else if(object.getString("result").equals("failure")){
					alertDialog.setMessage("Failure! Looks like there is some error.");
					alertDialog.show();
				}
				else {
			        successDialog.setMessage("Registration success! An email has been sent to you to verify your email address.");
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
