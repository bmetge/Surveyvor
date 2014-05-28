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

public class ForgotPassword extends Activity {
	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;
	private AlertDialog successDialog; 
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(ForgotPassword.this);
        AlertDialog.Builder builder = new AlertDialog.Builder(ForgotPassword.this);
		// Add the buttons
		builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
		           public void onClick(DialogInterface dialog, int id) {
		               // User clicked OK button
		        	   Intent intent = new Intent(ForgotPassword.this, LoginActivity.class);
				        startActivity(intent);
		           }
		       });
		successDialog = builder.create();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_forgot_password, menu);
        return true;
    }

    public void onClickValidate(View v) {
    	ForgotPasswordTask task = new ForgotPasswordTask();
    	EditText email= (EditText) findViewById(R.id.editText1);
		task.execute("account/forgot_password/", "email="+email.getText().toString());

    }
    
    private class ForgotPasswordTask extends AsyncTask<String, Void, String> {

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
					alertDialog.setMessage("Invalid email");
					alertDialog.show();
				}
				else if(object.getBoolean("email_not_found")){
						alertDialog.setMessage("Email not found");
						alertDialog.show();
				}
				else if(object.getString("result").equals("failure")){
					alertDialog.setMessage("Failure !");
					alertDialog.show();
				}
				else{
					successDialog.setMessage("An email has been sent to you with your new password.");
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
